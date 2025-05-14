import prisma from '../../../shared/prisma';
import { ParticipationStatus, PaymentStatus } from '@prisma/client';
import { SSLService } from '../SSL/ssl.service';
import ApiError from '../../errors/APIError';
import { HttpStatusCode } from 'axios';
// Removed incorrect import of `undefined` from 'zod'

const initPayment = async (eventId: string) => {
    const eventData = await prisma.events.findFirstOrThrow({
        where: { id: eventId },
        include: {
            organizer: true,
            participation: {
                where: {
                    eventId: eventId
                },
                include: {
                    user: true
                }
            }
        }
    });
    console.log({eventData});
    

    // Get the first participation entry
    const participationData = eventData.participation[0];

    // Check if participation data exists
    if (!participationData) {
        throw new ApiError(HttpStatusCode.NotFound, "No participation found for this event.");
    }

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save payment record in DB
    await prisma.payment.create({
        data: {
            transactionId,
            amount: eventData.registration_fee,
            payment_status: PaymentStatus.PAID,
            eventId,
            participationId: participationData.id,
            paymentGatewayData: {}, // Add appropriate default or mock data here
            eventsId: eventId // Assuming `eventId` corresponds to `eventsId`
        }
    });

    // Prepare data for SSLCommerz
    const initPaymentData = {
        amount: eventData.registration_fee,
        transactionId,
        name: participationData?.user.name || 'N/A',
        email: participationData?.user.email || 'N/A',
        address: 'N/A',
        contactNumber: participationData?.user.contactNumber || 'N/A'
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
            message: "Payment Failed!"
        }
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
        await tx.participation.update({
            where: {
                id: updatedPaymentData.participationId // Use a unique identifier like `id` or `userId_eventId`
            },
            data: {
                status: ParticipationStatus.PENDING
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
