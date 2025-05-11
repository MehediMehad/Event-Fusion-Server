import prisma from '../../../shared/prisma';
import { IPaymentData } from '../SSL/ssl.interface';
import { SSLService } from '../SSL/ssl.service';
import { ParticipationStatus, PaymentStatus } from '@prisma/client';

const initPayment = async (participationId: string) => {
       const paymentData = await prisma.payment.findFirst({
        where: {
            participation_id: participationId
        },
        select:{
            id: true
        }
    });
    console.log({paymentData});
    


    const initPaymentData = {
        amount: 100,
        transactionId:"641638597",
        name: "DD",
        email:"SS",
        phoneNumber: "ii"
    };


    const result = await SSLService.initPayment(initPaymentData);
    console.log(result.GatewayPageURL);
    
    return {
        paymentUrl: result.GatewayPageURL
    };
};

// ssl commerz ipn listener query
// amount=1150.00&bank_tran_id=151114130739MqCBNx5&card_brand=VISA&card_issuer=BRAC+BANK%2C+LTD.&card_issuer_country=Bangladesh&card_issuer_country_code=BD&card_no=432149XXXXXX0667&card_type=VISA-Brac+bank¤cy=BDT&status=VALID&store_amount=1104.00&store_id=progr6606bdd704623&tran_date=2015-11-14+13%3A07%3A12&tran_id=5646dd9d4b484&val_id=151114130742Bj94IBUk4uE5GRj&verify_sign=490d86b8ac5faa016f695b60972a7fac&verify_key=amount%2Cbank_tran_id%2Ccard_brand%2Ccard_issuer%2Ccard_issuer_country%2Ccard_issuer_country_code%2Ccard_no%2Ccard_type%2Ccurrency%2Cstatus%2Cstore_amount%2Cstore_id%2Ctran_date%2Ctran_id%2Cval_id

const validatePayment = async (payload: any) => {
    const response = await SSLService.validatePayment(payload);


        // if (!payload || !payload.status || !(payload.status === 'VALID')) {
    //     return {
    //         message: "Invalid Payment!"
    //     }
    // }

    // const response = await SSLService.validatePayment(payload);

    // if (response?.status !== 'VALID') {
    //     return {
    //         message: "Payment Failed!"
    //     }
    // }


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

        const eventData = await tx.events.findFirstOrThrow({
            where: {
                id: updatedPaymentData.eventId
            }
        });

        const participationUpdatedStatus = eventData.is_public
            ? ParticipationStatus.APPROVED
            : ParticipationStatus.PENDING;

        await tx.participation.update({
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
    });

    return {
        message: 'Payment success!'
    };
};

export const PaymentService = {
    initPayment,
    validatePayment
};
