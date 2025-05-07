import { ParticipationStatus, Prisma, Events as PrismaEvent } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { fileUploader } from '../../../helpers/fileUploader';
import { IFile } from '../../interface/file';
import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/APIError';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interface/pagination';
import { IEventFilterRequest } from './events.interface';
import { eventSearchableFields } from './event.constants';

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
    const event = await prisma.events.findUnique({
        where: {
            id,
            isDeleted: false
        },
        select: {
            id: true,
            title: true,
            date_time: true,
            venue: true,
            description: true,
            registration_fee: true,
            coverPhoto: true,
            is_public: true,
            is_paid: true,
            location: true,
            createdAt: true,
            organizer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true
                }
            },
            review: {
                select: {
                    id: true,
                    comment: true,
                    rating: true,
                    user: true,
                    created_at: true
                }
            },
            invitation: true,
            participation: true
        }
    });
    if (!event) {
        throw new Error('Event not found or deleted');
    }

    // meta data extract
    const metadata = {
        id: event.id,
        title: event.title,
        date_time: event.date_time,
        venue: event.venue,
        description: event.description,
        registration_fee: event.registration_fee,
        coverPhoto: event.coverPhoto,
        organizer: event.organizer,
        is_public: event.is_public,
        is_paid: event.is_paid,
        location: event.location,
        createdAt: event.createdAt
    };
    // remaining data
    const others = {
        review: event.review,
        invitation: event.invitation,
        participation: event.participation
    };

    return {
        metadata,
        ...others
    };
};

// TODO:
const getAllEventsFromDB = async (options: IPaginationOptions) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);

    const total = await prisma.events.count({
        where: {
            isDeleted: false
        }
    });

    const result = await prisma.events.findMany({
        where: {
            isDeleted: false
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip: skip,
        take: limit
    });

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    };
};

const getAllEventsDetailsPage = async (
    filters: IEventFilterRequest,
    options: IPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, filterData } = filters;

    const andConditions: Prisma.EventsWhereInput[] = [];

    // Rest of your filter conditions remain the same
    if (filterData) {
        if (filterData === 'PUBLIC_FREE') {
            andConditions.push({
                is_public: true,
                is_paid: false
            });
        }
        if (filterData === 'PUBLIC_PAID') {
            andConditions.push({
                is_public: true,
                is_paid: true
            });
        }
        if (filterData === 'PRIVATE_FREE') {
            andConditions.push({
                is_public: false,
                is_paid: false
            });
        }
        if (filterData === 'PRIVATE_PAID') {
            andConditions.push({
                is_public: false,
                is_paid: true
            });
        }
    }

    const total = await prisma.events.count({
        where: {
            OR: [
                {
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    organizer: {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    }
                }
            ],
            AND: andConditions
        }
    });

    const result = await prisma.events.findMany({
        where: {
            OR: [
                {
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                {
                    organizer: {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    }
                }
            ],
            AND: andConditions
        },
        include: {
            organizer: {
                select: {
                    id: true,
                    name: true
                    // include other organizer fields you need
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip: skip,
        take: limit
    });

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    };
};

const updateIntoDB = async (req: Request, id: string): Promise<PrismaEvent> => {
    const file = req.file as IFile;

    const oldData = await prisma.events.findUniqueOrThrow({
        where: { id }
    });

    if (req.user.userId !== oldData.organizerId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'YOU ARE UNAUTHORIZED');
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

    const result = await prisma.events.update({
        where: { id },
        data: eventData
    });

    return result;
};

const joinEvent = async (req: Request) => {
    const userId = req.user.userId;
    const { joinType } = req.body;

    const existingEvent = await prisma.events.findFirstOrThrow({
        where: {
            id: req.body.eventId
        }
    });
    if (!existingEvent) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Event Not Found');
    }

    const participationData = {
        userId: userId,
        eventId: req.body.eventId,
        paymentId: req.body.paymentId,
        payment_status: req.body.payment_status
    };

    if (joinType === 'JOIN_FOR_FREE') {
        const joinEvent = await prisma.participation.create({
            data: {
                ...participationData,
                status: ParticipationStatus.APPROVED
            }
        });
        return joinEvent
    }

};

export const EventService = {
    createEvent,
    getAllUpcomingEvent,
    getByIdFromDB,
    updateIntoDB,
    getAllEventsFromDB,
    getAllEventsDetailsPage,
    joinEvent
};
