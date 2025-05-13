"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const user_constant_1 = require("./user.constant");
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const config_1 = __importDefault(require("../../../config"));
const APIError_1 = __importDefault(require("../../errors/APIError"));
const http_status_1 = __importDefault(require("http-status"));
const registrationNewUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (file) {
        const fileUploadToCloudinary = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        req.body.profilePhoto = fileUploadToCloudinary === null || fileUploadToCloudinary === void 0 ? void 0 : fileUploadToCloudinary.secure_url;
    }
    const hashPassword = yield bcrypt.hash(req.body.password, 12);
    const userData = {
        email: req.body.email,
        profilePhoto: req.body.profilePhoto,
        name: req.body.name,
        contactNumber: req.body.contactNumber,
        password: hashPassword,
        role: client_1.UserRole.USER,
        gender: req.body.gender
    };
    const result = yield prisma_1.default.user.create({
        data: userData
    });
    const data = {
        userId: result.id,
        email: userData.email,
        role: userData.role
    };
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken(data, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in); // "5m"
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken(data, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.refresh_token_expires_in); // "30d"
    return {
        data: result,
        accessToken,
        refreshToken
    };
});
const getAllFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andCondition = [];
    if (params.searchTerm) {
        andCondition.push({
            OR: user_constant_1.userSearchAbleFields.map((field) => ({
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
                    equals: filterData[key]
                    // mode: 'insensitive'    // insensitive you can not use equals only use contains
                }
            }))
        });
    }
    // console.dir(andCondition, { depth: null });
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield prisma_1.default.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder
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
    const total = yield prisma_1.default.user.count({
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
});
const getAllUsersWithStats = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            OR: ['name', 'email'].map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andCondition.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: { equals: filterData[key] },
            })),
        });
    }
    const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};
    const result = yield prisma_1.default.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: sortBy && sortOrder
            ? { [sortBy]: sortOrder }
            : { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            profilePhoto: true,
            email: true,
            status: true,
            events: {
                select: {
                    id: true,
                },
            },
            participation: {
                where: {
                    status: 'APPROVED',
                },
                select: {
                    id: true,
                },
            },
            _count: {
                select: {
                    events: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.user.count({ where: whereCondition });
    // Manually count paid events
    const userIds = result.map(u => u.id);
    const paidParticipationCounts = yield prisma_1.default.participation.groupBy({
        by: ['userId'],
        where: {
            userId: { in: userIds },
            payment_status: 'COMPLETED',
            status: 'APPROVED',
        },
        _count: {
            id: true,
        },
    });
    const userMap = new Map(paidParticipationCounts.map(p => [p.userId, p._count.id]));
    const usersWithStats = result.map((user) => {
        const paidCount = userMap.get(user.id) || 0;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            profilePhoto: user.profilePhoto,
            totalJoinedEvents: user.participation.length,
            paidEventsCount: paidCount,
            publishedEventsCount: user._count.events,
        };
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: usersWithStats,
    };
});
const getMyInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
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
});
const getMyDashboardInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: userId,
            isDeleted: false
        }
    });
    if (!user) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Total Events Created by User
    const totalEvents = yield prisma_1.default.events.count({
        where: {
            organizerId: userId,
            isDeleted: false
        }
    });
    // Total Participants in all events created by the user
    const totalParticipants = yield prisma_1.default.participation.count({
        where: {
            event: {
                organizerId: userId
            },
            status: 'APPROVED'
        }
    });
    // Pending Invitations Received
    const pendingInvitations = yield prisma_1.default.invitation.count({
        where: {
            receiverId: userId,
            status: 'PENDING'
        }
    });
    // Total Reviews received on user's events
    const totalReviews = yield prisma_1.default.review.count({
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
});
const getAdminDashboardInfo = () => __awaiter(void 0, void 0, void 0, function* () {
    // Total Events (excluding deleted ones)
    const totalEvents = yield prisma_1.default.events.count({
        where: {
            isDeleted: false
        }
    });
    // Total Public Events
    const totalPublicEvents = yield prisma_1.default.events.count({
        where: {
            isDeleted: false,
            is_public: true
        }
    });
    // Total Private Events
    const totalPrivateEvents = yield prisma_1.default.events.count({
        where: {
            isDeleted: false,
            is_public: false
        }
    });
    // Total Approved Participants across all events
    const totalParticipants = yield prisma_1.default.participation.count({
        where: {
            status: 'APPROVED'
        }
    });
    // Total users
    const totalUser = yield prisma_1.default.user.count({
        where: {
            status: 'ACTIVE'
        }
    });
    // Total unique Organizers (Users who created at least one event)
    const totalOrganizers = yield prisma_1.default.user.count({
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
});
const updateUserProfile = (userId, req) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const oldData = yield prisma_1.default.user.findUniqueOrThrow({
        where: { id: userId }
    });
    let profilePhoto = oldData.profilePhoto;
    if (file) {
        const uploaded = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        if (uploaded === null || uploaded === void 0 ? void 0 : uploaded.secure_url) {
            profilePhoto = uploaded.secure_url;
        }
    }
    const userData = { profilePhoto };
    if (req.body.name)
        userData.name = req.body.name;
    if (req.body.email)
        userData.email = req.body.email;
    if (req.body.contactNumber)
        userData.contactNumber = req.body.contactNumber;
    if (req.body.gender)
        userData.gender = req.body.gender;
    const result = yield prisma_1.default.user.update({
        where: { id: userId },
        data: userData
    });
    return result;
});
const changeProfileStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id
        }
    });
    const updateUserStatus = yield prisma_1.default.user.update({
        where: {
            id
        },
        data: status
    });
    return updateUserStatus;
});
const getNonParticipants = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
    // Find all users who participated in this event
    const participants = yield prisma_1.default.participation.findMany({
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
    const nonParticipants = yield prisma_1.default.user.findMany({
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
                            equals: (_a = (yield prisma_1.default.events.findUnique({
                                where: { id: eventId },
                                select: { organizerId: true }
                            }))) === null || _a === void 0 ? void 0 : _a.organizerId
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
});
exports.UserService = {
    registrationNewUser,
    getAllFromDB,
    changeProfileStatus,
    getNonParticipants,
    updateUserProfile,
    getMyInfo,
    getMyDashboardInfo,
    getAdminDashboardInfo,
    getAllUsersWithStats
};
