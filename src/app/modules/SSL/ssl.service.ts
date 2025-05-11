import axios from "axios";
import config from "../../../config";
import httpStatus from "http-status";
import { IPaymentData } from "./ssl.interface";
import ApiError from "../../errors/APIError";

const initPayment = async (paymentData: any) => {
    console.log('😎😎',paymentData);
    
    try {
        const data = {
            store_id: config.ssl.storeId,
            store_passwd: config.ssl.storePass,
            total_amount: paymentData.amount,
            currency: 'BDT',
            tran_id: paymentData.transactionId, // use unique tran_id for each api call
            success_url: config.ssl.successUrl,
            fail_url: config.ssl.failUrl,
            cancel_url: config.ssl.cancelUrl,
            ipn_url: 'http://localhost:3030/ipn',
            shipping_method: 'N/A',
            product_name: 'Booking',
            product_category: 'Service',
            product_profile: 'general',
            cus_name: paymentData.name,
            cus_email: paymentData.email,
            cus_add1: "N/A",
            cus_add2: 'N/A',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: paymentData.contactNumber,
            cus_fax: '01711111111',
            ship_name: 'N/A',
            ship_add1: 'N/A',
            ship_add2: 'N/A',
            ship_city: 'N/A',
            ship_state: 'N/A',
            ship_postcode: 1000,
            ship_country: 'N/A',
        };
            console.log(data);
            
        const response = await axios({
            method: 'post',
            url: config.ssl.sslPaymentApi,
            data: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        return response.data;
    }
    catch (err) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Payment error occurred!")
    }
};


const validatePayment = async (payload: any) => {
    console.log("😂", payload);
    
    try {
        const response = await axios({
            method: 'GET',
            url: `${config.ssl.sslValidationApi}?val_id=${payload.val_id}&store_id=${config.ssl.storeId}&store_passwd=${config.ssl.storePass}&format=json`
        });

        return response.data;
    }
    catch (err) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Payment validation failed!")
    }
}


export const SSLService = {
    initPayment,
    validatePayment
}

// amount=1150.00&bank_tran_id=151114130739MqCBNx5&card_brand=VISA&card_issuer=BRAC+BANK%2C+LTD.&card_issuer_country=Bangladesh&card_issuer_country_code=BD&card_no=432149XXXXXX0667&card_type=VISA-Brac+bank¤cy=BDT&status=VALID&store_amount=1104.00&store_id=level6820a7af20bb0&tran_date=2015-11-14+13%3A07%3A12&tran_id=5646dd9d4b484&val_id=151114130742Bj94IBUk4uE5GRj&verify_sign=b109093030bb50a3511431dfe75fce25&verify_key=amount%2Cbank_tran_id%2Ccard_brand%2Ccard_issuer%2Ccard_issuer_country%2Ccard_issuer_country_code%2Ccard_no%2Ccard_type%2Ccurrency%2Cstatus%2Cstore_amount%2Cstore_id%2Ctran_date%2Ctran_id%2Cval_id