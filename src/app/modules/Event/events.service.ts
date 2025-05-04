import { Events as PrismaEvent } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { fileUploader } from '../../../helpers/fileUploader';
import { IFile } from '../../interface/file';
import { format } from 'date-fns';
import { Request } from 'express';

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

const getUpcomingLastEvent = async () => {
    const now = new Date();

    const events = await prisma.events.findMany({
        where: {
            isDeleted: false,
            status: 'UPCOMING',
        },
        orderBy: {
            date_time: 'asc' // string sort
        },
        include: {
            organizer: true
        }
    });

    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date_time.replace(' ', 'T')); // 📝 string -> Date
        return eventDate >= now;
    });

    const result = filteredEvents.length > 0 ? filteredEvents[0] : null;

    return result;
};


export const EventService = {
    createEvent,
    getUpcomingLastEvent
};
