import prisma from '../../../shared/prisma';
import { ParticipationStatus, PaymentStatus } from '@prisma/client';
import { SSLService } from '../SSL/ssl.service';
import ApiError from '../../errors/APIError';
import { HttpStatusCode } from 'axios';
// Removed incorrect import of `undefined` from 'zod'

const initPayment = async (eventId: string, userId: string) => {    
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        }
    });
    const event = await prisma.events.findFirstOrThrow({
        where: {
            id: eventId
        }
    });

    if (!event) {
        throw new ApiError(HttpStatusCode.NotFound, 'Event not found');
    }

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save payment record in DB
    await prisma.payment.create({
        data: {
            transactionId,
            amount: event.registration_fee,
            payment_status: PaymentStatus.PAID,
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
        name: user?.name || 'N/A',
        email: user.email || 'N/A',
        address: 'N/A',
        contactNumber: user.contactNumber || 'N/A'
    };

    const result = await SSLService.initPayment(initPaymentData);

    return {
        paymentUrl: result.GatewayPageURL
    };
};

// ssl commerz ipn listener query example:
// amount=1150.00&bank_tran_id=...&status=VALID&tran_id=...&val_id=...

const validatePayment = async (payload: any) => {
    if (!payload || !payload.status || !payload.status) {
        return { message: 'INVALID PAYMENT' };
    }

    const response = await SSLService.validatePayment(payload);

    if (response?.status !== 'VALID') {
        return {
            message: 'Payment Failed!'
        };
    }

    await prisma.$transaction(async (tx) => {
        const updatedPaymentData = await tx.payment.update({
            where: {
                transactionId: response.tran_id
            },
            data: {
                payment_status: PaymentStatus.PAID,
                paymentGatewayData: response
            }
        });

        // Update participation's payment status
        await tx.participation.create({
            data: {
                eventId: updatedPaymentData.eventId,
                status: ParticipationStatus.PENDING,
                userId: updatedPaymentData.userId // Assuming `participationId` corresponds to `userId`
            }
        });
    });

    return {
        message: 'Payment success!'
    };
};

export const PaymentService = {
    initPayment,
    validatePayment
};
