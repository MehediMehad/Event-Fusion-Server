import express from 'express';
import auth from '../../middlewares/auth';
import { PaymentController } from './payment.controller';

const router = express.Router();

import {
  AuthorizedPaymentPayloadSchema,
  capturedPaymentPayloadSchema,
  refundPaymentPayloadSchema,
  saveNewCardWithExistingCustomerPayloadSchema,
  TStripeSaveWithCustomerInfoPayloadSchema,
} from './payment.validation';
import validateRequest from '../../middlewares/validateRequest';
import {Role as UserRole } from '@prisma/client';

// create a new customer with card
router.get(
  "/save-card",
  auth(),
  PaymentController.getMySavedCards
);
router.post(
  "/save-card",
  auth(),
  validateRequest(TStripeSaveWithCustomerInfoPayloadSchema),
  PaymentController.saveCardWithCustomerInfo
);

// Authorize the customer with the amount and send payment request


// Capture the payment request and deduct the amount
router.post(
  "/capture-payment",
  validateRequest(capturedPaymentPayloadSchema),
  PaymentController.capturePaymentRequest
);

// Save new card to existing customer
router.post(
  "/save-new-card",
  auth(),
  validateRequest(saveNewCardWithExistingCustomerPayloadSchema),
  PaymentController.saveNewCardWithExistingCustomer
);

// Delete card from customer
router.delete(
  "/delete-card/:paymentMethodId",
  PaymentController.deleteCardFromCustomer
);

// Refund payment to customer
router.post(
  "/refund-payment",
  auth(),
  PaymentController.refundPaymentToCustomer
);





router.get("/customers/:customerId", PaymentController.getCustomerDetails);





router.get("/:customerId", PaymentController.getCustomerSavedCards);





export const PaymentRouters = router;
