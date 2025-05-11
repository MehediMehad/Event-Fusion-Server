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
const ssl_service_1 = require("../SSL/ssl.service");
const client_1 = require("@prisma/client");
const initPayment = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentData = yield prisma_1.default.payment.findFirstOrThrow({
        where: {
            eventId
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    contactNumber: true
                }
            }
        }
    });
    const initPaymentData = {
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        name: paymentData.user.name,
        email: paymentData.user.email,
        phoneNumber: paymentData.user.contactNumber
    };
    const result = yield ssl_service_1.SSLService.initPayment(initPaymentData);
    return {
        paymentUrl: result.GatewayPageURL
    };
});
// ssl commerz ipn listener query
// amount=1150.00&bank_tran_id=151114130739MqCBNx5&card_brand=VISA&card_issuer=BRAC+BANK%2C+LTD.&card_issuer_country=Bangladesh&card_issuer_country_code=BD&card_no=432149XXXXXX0667&card_type=VISA-Brac+bank¤cy=BDT&status=VALID&store_amount=1104.00&store_id=progr6606bdd704623&tran_date=2015-11-14+13%3A07%3A12&tran_id=5646dd9d4b484&val_id=151114130742Bj94IBUk4uE5GRj&verify_sign=490d86b8ac5faa016f695b60972a7fac&verify_key=amount%2Cbank_tran_id%2Ccard_brand%2Ccard_issuer%2Ccard_issuer_country%2Ccard_issuer_country_code%2Ccard_no%2Ccard_type%2Ccurrency%2Cstatus%2Cstore_amount%2Cstore_id%2Ctran_date%2Ctran_id%2Cval_id
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ssl_service_1.SSLService.validatePayment(payload);
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
        const eventData = yield tx.events.findFirstOrThrow({
            where: {
                id: updatedPaymentData.eventId
            }
        });
        const participationUpdatedStatus = eventData.is_public
            ? client_1.ParticipationStatus.APPROVED
            : client_1.ParticipationStatus.PENDING;
        yield tx.participation.update({
            where: {
                userId_eventId: {
                    userId: updatedPaymentData.userId,
                    eventId: updatedPaymentData.eventId
                }
            },
            data: {
                status: participationUpdatedStatus
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
