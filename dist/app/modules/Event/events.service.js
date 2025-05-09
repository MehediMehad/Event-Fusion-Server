"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const http_status_1 = __importDefault(require("http-status"));
const APIError_1 = __importDefault(require("../../errors/APIError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const participation_constents_1 = require("../Participation/participation.constents");
const createEvent = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const file = req.file;
    if (file) {
        const fileUploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.event.coverPhoto = fileUploadToCloudinary === null || fileUploadToCloudinary === void 0 ? void 0 : fileUploadToCloudinary.secure_url;
    }
    const eventData = {
        organizerId: req.body.organizerId,
        title: req.body.event.title,
        description: req.body.event.description,
        coverPhoto: req.body.event.coverPhoto,
        date_time: req.body.event.date_time,
        venue: req.body.event.venue,
        location: req.body.event.location,
        is_public: (_a = req.body.event.is_public) !== null && _a !== void 0 ? _a : true,
        is_paid: (_b = req.body.event.is_paid) !== null && _b !== void 0 ? _b : false,
        registration_fee: Number(req.body.event.registration_fee)
    };
    const result = yield prisma_1.default.events.create({
        data: eventData
    });
    return result;
});
const getAllUpcomingEvent = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const events = yield prisma_1.default.events.findMany({
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
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.events.findUnique({
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
            participation: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePhoto: true,
                            email: true
                        }
                    }
                }
            }
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
    return Object.assign({ metadata }, others);
});
const getMyEventsFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const events = yield prisma_1.default.events.findMany({
        where: {
            organizerId: userId,
            isDeleted: false // optional, if you want to exclude deleted events
        },
        include: {
            organizer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true
                }
            },
            invitation: {
                where: {
                    status: client_1.InvitationStatus.ACCEPTED // optional: only count accepted invites
                },
                select: {
                    id: true
                }
            },
            participation: {
                where: {
                    status: client_1.ParticipationStatus.APPROVED // optional: only count confirmed participants
                },
                select: {
                    id: true
                }
            }
        },
        orderBy: {
            date_time: 'asc' // or 'desc' based on your need
        }
    });
    return events;
});
const getAllEventsDetailsPage = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, filterData } = filters;
    const andConditions = [];
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
    const total = yield prisma_1.default.events.count({
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
    const events = yield prisma_1.default.events.findMany({
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
    const now = new Date();
    const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.date_time.replace(' ', 'T')); // 📝 string -> Date
        return eventDate >= now;
    });
    return {
        meta: {
            total,
            page,
            limit
        },
        data: filteredEvents
    };
});
const updateIntoDB = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const file = req.file;
    const oldData = yield prisma_1.default.events.findUniqueOrThrow({
        where: { id }
    });
    if (req.user.userId !== oldData.organizerId) {
        throw new APIError_1.default(http_status_1.default.UNAUTHORIZED, 'YOU ARE UNAUTHORIZED');
    }
    if (file) {
        const fileUploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.event.coverPhoto =
            (fileUploadToCloudinary === null || fileUploadToCloudinary === void 0 ? void 0 : fileUploadToCloudinary.secure_url) || oldData.coverPhoto;
    }
    else {
        req.body.event.coverPhoto = oldData.coverPhoto;
    }
    const eventData = {
        title: (_a = req.body.event.title) !== null && _a !== void 0 ? _a : oldData.title,
        description: (_b = req.body.event.description) !== null && _b !== void 0 ? _b : oldData.description,
        coverPhoto: req.body.event.coverPhoto,
        date_time: (_c = req.body.event.date_time) !== null && _c !== void 0 ? _c : oldData.date_time,
        venue: (_d = req.body.event.venue) !== null && _d !== void 0 ? _d : oldData.venue,
        location: (_e = req.body.event.location) !== null && _e !== void 0 ? _e : oldData.location,
        is_public: (_f = req.body.event.is_public) !== null && _f !== void 0 ? _f : oldData.is_public,
        is_paid: (_g = req.body.event.is_paid) !== null && _g !== void 0 ? _g : oldData.is_paid,
        registration_fee: req.body.event.registration_fee !== undefined
            ? Number(req.body.event.registration_fee)
            : oldData.registration_fee
    };
    const result = yield prisma_1.default.events.update({
        where: { id },
        data: eventData
    });
    return result;
});
// TODO:
const joinEvent = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const existingEvent = yield prisma_1.default.events.findFirstOrThrow({
        where: {
            id: req.body.eventId
        }
    });
    if (!existingEvent) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'Event Not Found');
    }
    let joinType;
    if (!existingEvent.is_public && existingEvent.registration_fee > 0) {
        joinType = 'REQUEST_AND_PAY';
    }
    else if (!existingEvent.is_public &&
        existingEvent.registration_fee === 0) {
        joinType = 'REQUEST_TO_JOIN';
    }
    else if (existingEvent.is_public && existingEvent.registration_fee > 0) {
        joinType = 'PAY_AND_JOIN';
    }
    else {
        joinType = 'JOIN_FOR_FREE';
    }
    const participationData = {
        userId: userId,
        eventId: req.body.eventId,
        paymentId: req.body.paymentId,
        payment_status: req.body.payment_status
    };
    if (joinType === participation_constents_1.joinTypeEnum.JOIN_FOR_FREE) {
        const joinEvent = yield prisma_1.default.participation.create({
            data: Object.assign(Object.assign({}, participationData), { status: client_1.ParticipationStatus.APPROVED })
        });
        return joinEvent;
    }
    if (joinType === participation_constents_1.joinTypeEnum.REQUEST_TO_JOIN) {
        const joinEvent = yield prisma_1.default.participation.create({
            data: Object.assign(Object.assign({}, participationData), { status: client_1.ParticipationStatus.PENDING })
        });
        return joinEvent;
    }
    // TODO:
    if (joinType === participation_constents_1.joinTypeEnum.REQUEST_AND_PAY) {
        const joinEvent = yield prisma_1.default.participation.create({
            data: Object.assign(Object.assign({}, participationData), { status: client_1.ParticipationStatus.REJECTED })
        });
        return joinEvent;
    }
});
// Check if user is admin
const isUserAdmin = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    return (user === null || user === void 0 ? void 0 : user.role) === client_1.UserRole.ADMIN;
});
const deleteEvent = (eventId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.events.findUnique({
        where: { id: eventId },
        include: {
            participation: true,
            invitation: true,
            review: true
        }
    });
    if (!event) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    // check permission
    const isOrganizer = event.organizerId === userId;
    const isAdmin = yield isUserAdmin(userId);
    if (!isOrganizer && !isAdmin) {
        throw new APIError_1.default(http_status_1.default.UNAUTHORIZED, "You can't delete this event");
    }
    // Start transaction to delete all relations and the event
    const result = yield prisma_1.default.$transaction([
        // Optional: Delete related data or disconnect them
        prisma_1.default.participation.deleteMany({
            where: { eventId: eventId }
        }),
        prisma_1.default.invitation.deleteMany({
            where: { event_id: eventId }
        }),
        prisma_1.default.review.deleteMany({
            where: { eventId: eventId }
        }),
        // Finally delete the event
        prisma_1.default.events.delete({
            where: { id: eventId }
        })
    ]);
    return result;
});
exports.EventService = {
    createEvent,
    getAllUpcomingEvent,
    getByIdFromDB,
    updateIntoDB,
    getMyEventsFromDB,
    getAllEventsDetailsPage,
    joinEvent,
    deleteEvent
};
