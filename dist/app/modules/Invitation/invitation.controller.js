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
exports.InvitationsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const invitation_service_1 = require("./invitation.service");
const catchAsync_1 = require("../../../shared/catchAsync");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const APIError_1 = __importDefault(require("../../errors/APIError"));
const sendInviteUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { receiverId } = req.body;
    const { eventId } = req.params;
    if (!eventId) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'eventId not found');
    }
    const result = yield invitation_service_1.InvitationsService.sendInviteUser({ receiverId, eventId }, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Invitation sent successfully!',
        data: result
    });
}));
const myPendingNotification = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new APIError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    }
    const result = yield invitation_service_1.InvitationsService.myPendingNotification(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Pending notifications fetched successfully!',
        data: result
    });
}));
const getNotification = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new APIError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    }
    const result = yield invitation_service_1.InvitationsService.getNotification(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'My Notifications fetched successfully!',
        data: result
    });
}));
// invitation.controller.ts
const acceptDeclineInvitation = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { status, invitationId } = req.body; // 'ACCEPTED' or 'REJECTED'
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new APIError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    }
    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
        throw new APIError_1.default(http_status_1.default.BAD_REQUEST, 'Valid status is required (ACCEPTED/REJECTED)');
    }
    const result = yield invitation_service_1.InvitationsService.acceptDeclineInvitation(invitationId, userId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Invitation ${status.toLowerCase()} successfully!`,
        data: result
    });
}));
exports.InvitationsController = {
    sendInviteUser,
    myPendingNotification,
    getNotification,
    acceptDeclineInvitation
};
