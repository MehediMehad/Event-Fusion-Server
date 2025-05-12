import prisma from '../../../shared/prisma';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { fileUploader } from '../../../helpers/fileUploader';
import { IFile } from '../../interface/file';
import { Request } from 'express';
import { IPaginationOptions } from '../../interface/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { userSearchAbleFields } from './user.constant';
import { jwtHelpers, TPayloadToken } from '../../../helpers/jwtHelpers';
import config from '../../../config';
import ApiError from '../../errors/APIError';
import httpStatus from 'http-status';

const registrationNewUser = async (req: Request) => {
    const file = req.file as IFile;

    if (file) {
        const fileUploadToCloudinary =
            await fileUploader.uploadToCloudinary(file);

        req.body.profilePhoto = fileUploadToCloudinary?.secure_url;
    }

    const hashPassword: string = await bcrypt.hash(req.body.password, 12);
    const userData = {
        email: req.body.email,
        profilePhoto: req.body.profilePhoto,
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
        userId: result.id,
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
            updatedAt: true
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

const getMyInfo = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,
            gender: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        throw new Error('User not found!');
    }

    return user;
};

const getMyDashboardInfo = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
            isDeleted: false
        }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Total Events Created by User
    const totalEvents = await prisma.events.count({
        where: {
            organizerId: userId,
            isDeleted: false
        }
    });

    // Total Participants in all events created by the user
    const totalParticipants = await prisma.participation.count({
        where: {
            event: {
                organizerId: userId
            },
            status: 'APPROVED'
        }
    });

    // Pending Invitations Received
    const pendingInvitations = await prisma.invitation.count({
        where: {
            receiverId: userId,
            status: 'PENDING'
        }
    });

    // Total Reviews received on user's events
    const totalReviews = await prisma.review.count({
        where: {
            event: {
                organizerId: userId
            }
        }
    });

    // Total Earnings from paid events  // TODO
    // const totalEarnings = await prisma.payment.aggregate({
    //     _sum: {
    //         amount: true
    //     },
    //     where: {
    //         participation: {
    //             some: {
    //                 event: {
    //                     organizerId: userId
    //                 }
    //             }
    //         },
    //         payment_status: 'PAID'
    //     }
    // });

    return {
        user,
        dashboardSummary: {
            totalEvents,
            totalParticipants,
            pendingInvitations,
            totalReviews,
            // totalEarnings: totalEarnings._sum.amount || 0 // TODO
        }
    };
};

const getAdminDashboardInfo = async () => {
  // Total Events (excluding deleted ones)
  const totalEvents = await prisma.events.count({
    where: {
      isDeleted: false
    }
  });

  // Total Public Events
  const totalPublicEvents = await prisma.events.count({
    where: {
      isDeleted: false,
      is_public: true
    }
  });

  // Total Private Events
  const totalPrivateEvents = await prisma.events.count({
    where: {
      isDeleted: false,
      is_public: false
    }
  });

  // Total Approved Participants across all events
  const totalParticipants = await prisma.participation.count({
    where: {
      status: 'APPROVED'
    }
  });
  // Total users
  const totalUser = await prisma.user.count({
    where: {
      status: 'ACTIVE'
    }
  });

  // Total unique Organizers (Users who created at least one event)
  const totalOrganizers = await prisma.user.count({
    where: {
      isDeleted: false,
      role: 'USER',
      events: {
        some: {
          isDeleted: false
        }
      }
    }
  });

  return {
    dashboardSummary: {
      totalEvents,
      totalPublicEvents,
      totalPrivateEvents,
      totalParticipants,
      totalOrganizers,
      totalUser
    }
  };
};



const updateUserProfile = async (userId: string, req: Request) => {
    const file = req.file as IFile;

    const oldData = await prisma.user.findUniqueOrThrow({
        where: { id: userId }
    });

    let profilePhoto = oldData.profilePhoto;

    if (file) {
        const uploaded = await fileUploader.uploadToCloudinary(file);
        if (uploaded?.secure_url) {
            profilePhoto = uploaded.secure_url;
        }
    }

    const userData: any = { profilePhoto };

    if (req.body.name) userData.name = req.body.name;
    if (req.body.email) userData.email = req.body.email;
    if (req.body.contactNumber) userData.contactNumber = req.body.contactNumber;
    if (req.body.gender) userData.gender = req.body.gender;

    const result = await prisma.user.update({
        where: { id: userId },
        data: userData
    });

    return result;
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

const getNonParticipants = async (eventId: string) => {
    const event = await prisma.events.findUnique({
        where: { id: eventId },
        include: {
            participation: true,
            invitation: true,
            review: true
        }
    });
    if (!event) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
    }

    // Find all users who participated in this event
    const participants = await prisma.participation.findMany({
        where: {
            eventId
        },
        select: {
            userId: true
        }
    });

    const participantIds = participants.map((p) => p.userId);

    // Get all users EXCEPT:
    // - Organizer of the event
    // - Admins
    // - Participants
    const nonParticipants = await prisma.user.findMany({
        where: {
            AND: [
                {
                    id: {
                        notIn: participantIds
                    }
                },
                {
                    id: {
                        not: {
                            equals: (
                                await prisma.events.findUnique({
                                    where: { id: eventId },
                                    select: { organizerId: true }
                                })
                            )?.organizerId
                        }
                    }
                },
                {
                    role: {
                        not: 'ADMIN'
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true
        }
    });
    return nonParticipants;
};

export const UserService = {
    registrationNewUser,
    getAllFromDB,
    changeProfileStatus,
    getNonParticipants,
    updateUserProfile,
    getMyInfo,
    getMyDashboardInfo,
    getAdminDashboardInfo
};
