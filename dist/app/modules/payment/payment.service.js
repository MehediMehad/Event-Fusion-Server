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
// Removed incorrect import of `undefined` from 'zod'
const initPayment = (eventId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const eventData = yield prisma_1.default.events.findFirstOrThrow({
        where: { id: eventId },
        include: {
            organizer: true,
            participation: {
                where: {
                    userId: userId
                },
                include: {
                    user: true
                }
            }
        }
    });
    const participationData = eventData.participation[0];
    const initPaymentData = {
        amount: eventData.registration_fee,
        transactionId: '497977',
        name: (participationData === null || participationData === void 0 ? void 0 : participationData.user.name) || 'N/A',
        email: (participationData === null || participationData === void 0 ? void 0 : participationData.user.email) || 'N/A',
        address: 'N/A',
        contactNumber: (participationData === null || participationData === void 0 ? void 0 : participationData.user.contactNumber) || 'N/A'
    };
    const result = yield ssl_service_1.SSLService.initPayment(initPaymentData);
    console.log(result);
    return {
        paymentUrl: result.GatewayPageURL
    };
});
// ssl commerz ipn listener query example:
// amount=1150.00&bank_tran_id=...&status=VALID&tran_id=...&val_id=...
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload || !payload.status || !(payload.status)) {
        return { message: "INVALID PAYMENT" };
    }
    // const response = await SSLService.validatePayment(payload);
    // if (response?.status !== 'VALID') {
    //     return {
    //         message: "Payment Failed!"
    //     }
    // }
    const response = payload;
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
        yield tx.participation.update({
            where: {
                id: updatedPaymentData.participationId // Use a unique identifier like `id` or `userId_eventId`
            },
            data: {
                status: client_1.ParticipationStatus.PENDING
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
