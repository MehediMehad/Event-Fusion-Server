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
exports.PaymentService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const client_1 = require("@prisma/client");
const ssl_service_1 = require("../SSL/ssl.service");
const APIError_1 = __importDefault(require("../../errors/APIError"));
const axios_1 = require("axios");
// Removed incorrect import of `undefined` from 'zod'
const initPayment = (eventId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: userId
        }
    });
    const event = yield prisma_1.default.events.findFirstOrThrow({
        where: {
            id: eventId
        }
    });
    if (!event) {
        throw new APIError_1.default(axios_1.HttpStatusCode.NotFound, 'Event not found');
    }
    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    // Save payment record in DB
    yield prisma_1.default.payment.create({
        data: {
            transactionId,
            amount: event.registration_fee,
            payment_status: client_1.PaymentStatus.PAID,
            eventId,
            userId,
            paymentGatewayData: {}, // Add appropriate default or mock data here
            eventsId: eventId // Assuming `eventId` corresponds to `eventsId`
        }
    });
    // Prepare data for SSLCommerz
    const initPaymentData = {
        amount: event.registration_fee,
        transactionId,
        name: (user === null || user === void 0 ? void 0 : user.name) || 'N/A',
        email: user.email || 'N/A',
        address: 'N/A',
        contactNumber: user.contactNumber || 'N/A'
    };
    const result = yield ssl_service_1.SSLService.initPayment(initPaymentData);
    return {
        paymentUrl: result.GatewayPageURL
    };
});
// ssl commerz ipn listener query example:
// amount=1150.00&bank_tran_id=...&status=VALID&tran_id=...&val_id=...
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload || !payload.status || !payload.status) {
        return { message: 'INVALID PAYMENT' };
    }
    const response = yield ssl_service_1.SSLService.validatePayment(payload);
    if ((response === null || response === void 0 ? void 0 : response.status) !== 'VALID') {
        return {
            message: 'Payment Failed!'
        };
    }
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedPaymentData = yield tx.payment.update({
            where: {
                transactionId: response.tran_id
            },
            data: {
                payment_status: client_1.PaymentStatus.PAID,
                paymentGatewayData: response
            }
        });
        // Update participation's payment status
        yield tx.participation.create({
            data: {
                eventId: updatedPaymentData.eventId,
                status: client_1.ParticipationStatus.PENDING,
                userId: updatedPaymentData.userId // Assuming `participationId` corresponds to `userId`
            }
        });
    }));
    return {
        message: 'Payment success!'
    };
});
exports.PaymentService = {
    initPayment,
    validatePayment
};
