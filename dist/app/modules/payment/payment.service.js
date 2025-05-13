"use strict";
// import httpStatus from "http-status";
// import Stripe from "stripe";
// import { TStripeSaveWithCustomerInfo } from "./payment.interface";
// import { User } from "@prisma/client";
// import prisma from "../../../shared/prisma";
// import ApiError from "../../errors/APIError";
// import { stripe } from "../../utils/stripe";
// const saveCardWithCustomerInfoIntoStripe = async (
//   userId: string,
//   payload: TStripeSaveWithCustomerInfo,
// ) => {
//     const {  paymentMethodId} = payload;
//     let user = await prisma.user.findUnique({
//       where:{
//         id: userId
//       },
//       include:{
//         customer: true
//       }
//     })
//     if(!user){
//       throw new ApiError(httpStatus.NOT_FOUND, "user Not found")
//     }
//     let customer: any;
// if(!user.customer?.stripeCustomerId){
//    customer = await stripe.customers.create({
//       email: user.email,
//       name: user.firstName + user.lastName || undefined,
//       phone: user.phoneNumber || undefined,
//     });
//      if (!customer.id) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create a Stripe customer");
//     }
//    const customerUpdate =   await prisma.customer.update({
//       where: {
//         id: userId,
//       },
//       data: {
//        stripeCustomerId: customer.id,
//       },
//     });
//     user.customer = customerUpdate
// }
//  if (!user.customer?.stripeCustomerId) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Customer not found");
//     }
//     const attach = await stripe.paymentMethods.attach(paymentMethodId, {
//       customer: user.customer?.stripeCustomerId,
//     });
//     const updateCustomer = await stripe.customers.update(user.customer?.stripeCustomerId, {
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });  
//     return user
// };
// /*
// const transferFundsWithStripe = async (userId: string, orderId: string) => {
//   const existingUser = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//     select: {
//       accountId: true,
//     },
//   });
//   const existingBooking = await prisma.order.findUnique({
//     where: {
//       id: orderId,
//     },
//     select: {
//       serviceId: true,
//       service: {
//         select: {
//           userId: true,
//         },
//       },
//       amount: true,
//       paymentIntentId: true,
//       status: true,
//     },
//   });
//   const user = await prisma.user.findUniqueOrThrow({
//     where: {
//       id: existingBooking?.service?.userId ?? "",
//     },
//     select: {
//       email: true,
//     },
//   });
//   //  const payment = await prisma.payment.create({
//   //    data: {
//   //      paymentIntentId: paymentIntent.id,
//   //      customerId,
//   //      paymentMethodId,
//   //      amount,
//   //      bookingId,
//   //      paymentDate: new Date(),
//   //    },
//   //    select: { id: true },
//   //  });
//   await prisma.order.update({
//     where: {
//       id: orderId,
//     },
//     data: {
//       status: "COMPLETED",
//     },
//   });
//   const paymentId = await prisma.payment.findFirst({
//     where: {
//       orderId: orderId,
//     },
//     select: {
//       id: true,
//     },
//   });
//   if (!paymentId) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
//   }
//   await prisma.payment.update({
//     where: {
//       id: paymentId.id,
//     },
//     data: {
//       isTransfer: true,
//     },
//   });
//   const paymentIntent = await stripe.paymentIntents.retrieve(
//     existingBooking?.paymentIntentId ?? ""
//   );
//   if (paymentIntent.status !== "succeeded") {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Payment intent has not been successful."
//     );
//   }
//   const amountReceived = paymentIntent.amount_received;
//   if (amountReceived <= 0) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "No funds available in the payment intent."
//     );
//   }
//   const destinationAccountId = existingUser?.accountId;
//   if (!destinationAccountId) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "No connected account found for the user."
//     );
//   }
//   const transferAmount = Math.floor(amountReceived * 0.9);
//   const transfer = await stripe.transfers.create({
//     amount: transferAmount,
//     currency: "usd",
//     destination: destinationAccountId,
//     description: "Transfer to connected account after payment",
//   });
//   return transfer;
// };
// */
// const capturePaymentRequestToStripe = async (payload: {
//   paymentIntentId: string;
// }) => {
//   try {
//     const { paymentIntentId } = payload;
//     const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
//     return paymentIntent;
//   } catch (error: any) {
//     throw new ApiError(httpStatus.CONFLICT, error.message);
//   }
// };
// const saveNewCardWithExistingCustomerIntoStripe = async (payload: {
//   customerId: string;
//   paymentMethodId: string;
// }) => {
//   try {
//     const { customerId, paymentMethodId } = payload;
//     // Attach the new PaymentMethod to the existing Customer
//     await stripe.paymentMethods.attach(paymentMethodId, {
//       customer: customerId,
//     });
//     // Optionally, set the new PaymentMethod as the default
//     await stripe.customers.update(customerId, {
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });
//     return {
//       customerId: customerId,
//       paymentMethodId: paymentMethodId,
//     };
//   } catch (error: any) {
//     throw new ApiError(httpStatus.CONFLICT, error.message);
//   }
// };
// const getCustomerSavedCardsFromStripe = async (customerId: string) => {
//   try {
//     // List all payment methods for the customer
//     const paymentMethods = await stripe.paymentMethods.list({
//       customer: customerId,
//       type: "card",
//     });
//     // Extract only the last4 digits from each payment method
//     const cards = paymentMethods.data.map((card) => ({
//       last4: card.card?.last4,
//       brand: card.card?.brand,
//       paymentMethodsId: card.id,
//     }));
//     return cards;
//   } catch (error: any) {
//     throw new ApiError(httpStatus.CONFLICT, error.message);
//   }
// };
// // Delete a card from a customer in the stripe
// const deleteCardFromCustomer = async (paymentMethodId: string) => {
//   try {
//     await stripe.paymentMethods.detach(paymentMethodId);
//     return { message: "Card deleted successfully" };
//   } catch (error: any) {
//     throw new ApiError(httpStatus.CONFLICT, error.message);
//   }
// };
// // Refund amount to customer in the stripe
// const refundPaymentToCustomer = async (payload: {
//   paymentIntentId: string;
// }) => {
//   try {
//     // Refund the payment intent
//     const refund = await stripe.refunds.create({
//       payment_intent: payload?.paymentIntentId,
//     });
//     return refund;
//   } catch (error: any) {
//     throw new ApiError(httpStatus.CONFLICT, error.message);
//   }
// };
// const getCustomerDetailsFromStripe = async (customerId: string) => {
//   try {
//     // Retrieve the customer details from Stripe
//     const customer = await stripe.customers.retrieve(customerId);
//     return customer;
//   } catch (error: any) {
//     throw new ApiError(httpStatus.NOT_FOUND, error.message);
//   }
// };
// /*
// const getAllCustomersFromStripe = async () => {
//   try {
//     // Retrieve all customers from Stripe
//     const customers = await stripe.customers.list({
//       limit: 2,
//     });
//     return customers;
//   } catch (error: any) {
//     throw new ApiError(httpStatus.CONFLICT, error.message);
//   }
// };
// const transactions = async () => {
//   const result = await prisma.payment.findMany({
//     where: {
//       isTransfer: true,
//     },
//     select: {
//       id: true,
//       amount: true,
//       isTransfer: true,
//     },
//   });
//   return result;
// };
// const generateNewAccountLink = async (user: User) => {
//   const accountLink = await stripe.accountLinks.create({
//     account: user.accountId as string,
//     refresh_url: "https://success-page-xi.vercel.app/not-success",
//     return_url: "https://success-page-xi.vercel.app/success",
//     type: "account_onboarding",
//   });
//   // console.log(accountLink.url, 'check account link');
//   const html = `
// <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 10px;">
//   <h2 style="color: #007bff; text-align: center;">Complete Your Onboarding</h2>
//   <p>Dear <b>${user.name}</b>,</p>
//   <p>We’re excited to have you onboard! To get started, please complete your onboarding process by clicking the link below:</p>
//   <div style="text-align: center; margin: 20px 0;">
//     <a href=${accountLink.url} style="background-color: #007bff; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
//       Complete Onboarding
//     </a>
//   </div>
//   <p>If the button above doesn’t work, you can also copy and paste this link into your browser:</p>
//   <p style="word-break: break-all; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">
//     ${accountLink.url}
//   </p>
//   <p><b>Note:</b> This link is valid for a limited time. Please complete your onboarding as soon as possible.</p>
//   <p>Thank you,</p>
//   <p><b>The Support Team</b></p>
//   <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
//   <p style="font-size: 12px; color: #777; text-align: center;">
//     If you didn’t request this, please ignore this email or contact support.
//   </p>
// </div>
// `;
//   await sendEmail(user?.email || "", "Your Onboarding Url", html);
// };
// const myPayment = async (userId: string) => {
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//     include:{
//         customer: true
//       }
//   });
//   const payment = await prisma.payment.findMany({
//     where: {
//       customerId: user.customer?.stripeCustomerId as string,
//     },
//     select: {
//       id: true,
//       amount: true,
//       paymentDate: true,
//     },
//   });
//   return payment;
// };
// */
// export const StripeServices = {
//   saveCardWithCustomerInfoIntoStripe,
//   getMySavedCards,
//   // createPayment,
//   capturePaymentRequestToStripe,
//   saveNewCardWithExistingCustomerIntoStripe,
//   getCustomerSavedCardsFromStripe,
//   deleteCardFromCustomer,
//   refundPaymentToCustomer,
//   getCustomerDetailsFromStripe,
//   // transferFundsWithStripe,
//   // getAllCustomersFromStripe,
//   // updateAccount,
//   // transactions,
//   // generateNewAccountLink,
//   // myPayment,
// };
