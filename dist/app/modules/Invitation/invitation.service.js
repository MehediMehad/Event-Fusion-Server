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
exports.InvitationsService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const APIError_1 = __importDefault(require("../../errors/APIError"));
const http_status_1 = __importDefault(require("http-status"));
const sendInviteUser = (payload, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, eventId } = payload;
    // Check if event exists
    const event = yield prisma_1.default.events.findUnique({
        where: { id: eventId }
    });
    if (!event) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    // Check if user exists
    const receiver = yield prisma_1.default.user.findUnique({
        where: { id: receiverId }
    });
    if (!receiver) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'Receiver not found');
    }
    // Check if already invited
    const existingInvite = yield prisma_1.default.invitation.findFirst({
        where: {
            receiverId,
            event_id: eventId
        }
    });
    if (existingInvite) {
        throw new APIError_1.default(http_status_1.default.CONFLICT, 'Already invited');
    }
    // Create invitation
    const invitation = yield prisma_1.default.invitation.create({
        data: {
            senderId,
            receiverId,
            event_id: eventId,
            status: client_1.InvitationStatus.PENDING
        }
    });
    return invitation;
});
const notification = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pendingInvitations = yield prisma_1.default.invitation.findMany({
        where: {
            receiverId: userId,
            status: client_1.InvitationStatus.PENDING // or InvitationStatus.PENDING if you are using enum
        },
        include: {
            sender: true,
            event: true
        }
    });
    return pendingInvitations;
});
const acceptDeclineInvitation = (invitationId, userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the invitation exists and receiver is this user
    const invitation = yield prisma_1.default.invitation.findFirst({
        where: {
            id: invitationId,
            receiverId: userId
        }
    });
    if (!invitation) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'Invitation not found or you are not authorized to respond.');
    }
    // Convert string to enum
    const enumStatus = status;
    // Update the status and respondedAt timestamp
    const updatedInvitation = yield prisma_1.default.invitation.update({
        where: {
            id: invitationId
        },
        data: {
            status: enumStatus
        },
        include: {
            sender: true,
            event: true
        }
    });
    return updatedInvitation;
});
exports.InvitationsService = {
    sendInviteUser,
    notification,
    acceptDeclineInvitation
};
