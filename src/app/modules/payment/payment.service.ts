import prisma from '../../../shared/prisma';
import { ParticipationStatus, PaymentStatus } from '@prisma/client';
import { SSLService } from '../SSL/ssl.service';
// Removed incorrect import of `undefined` from 'zod'

const initPayment = async (eventId: string, userId: string) => {
    const eventData = await prisma.events.findFirstOrThrow({
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
        name: participationData?.user.name || 'N/A',
        email: participationData?.user.email || 'N/A',
        address: 'N/A',
        contactNumber: participationData?.user.contactNumber || 'N/A'
    };
    const result = await SSLService.initPayment(initPaymentData);
    console.log(result);

    return {
        paymentUrl: result.GatewayPageURL
    };
};

// ssl commerz ipn listener query example:
// amount=1150.00&bank_tran_id=...&status=VALID&tran_id=...&val_id=...

const validatePayment = async (payload: any) => {
    if (!payload || !payload.status || !(payload.status)) {
        return {message: "INVALID PAYMENT"}

    }

     // const response = await SSLService.validatePayment(payload);
     
    // if (response?.status !== 'VALID') {
    //     return {
    //         message: "Payment Failed!"
    //     }
    // }
    const response = payload;

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
