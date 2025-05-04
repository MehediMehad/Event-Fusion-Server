import { Events as PrismaEvent } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { fileUploader } from '../../../helpers/fileUploader';
import { IFile } from '../../interface/file';
import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/APIError';

const createEvent = async (req: Request): Promise<PrismaEvent> => {
    const file = req.file as IFile;

    if (file) {
        const fileUploadToCloudinary =
            await fileUploader.uploadToCloudinary(file);
        req.body.event.coverPhoto = fileUploadToCloudinary?.secure_url;
    }

    const eventData = {
        organizerId: req.body.organizerId,
        title: req.body.event.title,
        description: req.body.event.description,
        coverPhoto: req.body.event.coverPhoto,
        date_time: req.body.event.date_time,
        venue: req.body.event.venue,
        location: req.body.event.location,
        is_public: req.body.event.is_public ?? true,
        is_paid: req.body.event.is_paid ?? false,
        registration_fee: Number(req.body.event.registration_fee)
    };

    const result = await prisma.events.create({
        data: eventData
    });

    return result;
};

const getAllUpcomingEvent = async () => {
    const now = new Date();

    const events = await prisma.events.findMany({
        where: {
            isDeleted: false,
            status: 'UPCOMING'
        },
        orderBy: {
            date_time: 'asc' // string sort
        },
        include: {
            organizer: true
        }
    });

    const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.date_time.replace(' ', 'T')); // 📝 string -> Date
        return eventDate >= now;
    });

    return filteredEvents;
};

const getByIdFromDB = async (id: string) => {
    const result = await prisma.events.findUnique({
        where: {
            id,
            isDeleted: false
        },
        include: {
            organizer: true,
            review: true
        }
    });
    return result;
};

const getMyEventsFromDB = async (id: string) => {
    const result = await prisma.events.findMany({
        where: {
            organizerId: id,
            isDeleted: false
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return result;
};

const updateIntoDB = async (req: Request, id: string): Promise<PrismaEvent> => {
    const file = req.file as IFile;

    const oldData = await prisma.events.findUniqueOrThrow({
        where: { id }
    });

    if (req.user.userId !== oldData.organizerId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "YOU ARE UNAUTHORIZED")
    }

    if (file) {
        const fileUploadToCloudinary =
            await fileUploader.uploadToCloudinary(file);
        req.body.event.coverPhoto =
            fileUploadToCloudinary?.secure_url || oldData.coverPhoto;
    } else {
        req.body.event.coverPhoto = oldData.coverPhoto;
    }

    const eventData = {
        title: req.body.event.title ?? oldData.title,
        description: req.body.event.description ?? oldData.description,
        coverPhoto: req.body.event.coverPhoto,
        date_time: req.body.event.date_time ?? oldData.date_time,
        venue: req.body.event.venue ?? oldData.venue,
        location: req.body.event.location ?? oldData.location,
        is_public: req.body.event.is_public ?? oldData.is_public,
        is_paid: req.body.event.is_paid ?? oldData.is_paid,
        registration_fee:
            req.body.event.registration_fee !== undefined
                ? Number(req.body.event.registration_fee)
                : oldData.registration_fee
    };
    console.log(eventData);

    const result = await prisma.events.update({
        where: { id },
        data: eventData
    });

    return result;
};

export const EventService = {
    createEvent,
    getAllUpcomingEvent,
    getByIdFromDB,
    updateIntoDB,
    getMyEventsFromDB
};
