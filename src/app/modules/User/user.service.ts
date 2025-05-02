import prisma from '../../../shared/prisma';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { fileUploader } from '../../../helpers/fileUploader';
import { IFile } from '../../interface/file';
import { Request } from 'express';
import { IPaginationOptions } from '../../interface/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { userSearchAbleFields } from './user.constant';
import { jwtHelpers, TPayloadToken } from '../../../helpers/jwtHelpers';
import config from '../../../config';

const registrationNewUser = async (req: Request)=> {
    const file = req.file as IFile;

    if (file) {
        const fileUploadToCloudinary =
            await fileUploader.uploadToCloudinary(file);

        req.body.user.profilePhoto = fileUploadToCloudinary?.secure_url;
    }

    const hashPassword: string = await bcrypt.hash(req.body.password, 12);
    const userData = {
        email: req.body.email,
        name: req.body.name,
        contactNumber: req.body.contactNumber,
        password: hashPassword,
        role: UserRole.USER,
        gender: req.body.gender
    };

    const result = await prisma.user.create({
        data: userData
    });


        const data: TPayloadToken = {
            email: userData.email,
            role: userData.role
        };
    
        const accessToken = jwtHelpers.generateToken(
            data,
            config.jwt.jwt_secret as string,
            config.jwt.expires_in as string
        ); // "5m"
    
        const refreshToken = jwtHelpers.generateToken(
            data,
            config.jwt.refresh_token_secret as string,
            config.jwt.refresh_token_expires_in as string
        ); // "30d"
        

    return {
        data: result,
        accessToken, 
        refreshToken
    };
};

const getAllFromDB = async (params: any, options: IPaginationOptions) => {
    console.log(25, options);
    const { page, limit, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const andCondition: Prisma.UserWhereInput[] = [];

    if (params.searchTerm) {
        andCondition.push({
            OR: userSearchAbleFields.map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: 'insensitive' // search case insensitive
                }
            }))
        });
    }
    if (Object.keys(filterData).length > 0) {
        andCondition.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key]
                    // mode: 'insensitive'    // insensitive you can not use equals only use contains
                }
            }))
        });
    }

    // console.dir(andCondition, { depth: null });

    const whereCondition: Prisma.UserWhereInput =
        andCondition.length > 0 ? { AND: andCondition } : {};

    const result = await prisma.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy:
            sortBy && sortOrder
                ? {
                      [sortBy]: sortOrder
                  }
                : {
                      createdAt: 'desc'
                  },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        }
        // include: {
        //     admin: true,
        //     patient: true,
        //     doctor: true
        // }
    });

    const total = await prisma.user.count({
        where: whereCondition
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
};

const changeProfileStatus = async (id: string, status: UserRole) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    });

    const updateUserStatus = await prisma.user.update({
        where: {
            id
        },
        data: status
    });

    return updateUserStatus;
};

export const UserService = {
    registrationNewUser,
    getAllFromDB,
    changeProfileStatus,
};
