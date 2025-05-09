import express from 'express';
import { ReviewsController } from './review.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { validateRequest } from '../../middlewares/validateRequest';
import { ReviewsValidation } from './review.validation';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.USER),
  validateRequest(ReviewsValidation.createReviewSchema),
  ReviewsController.sendReview
);

router.get(
  '/:eventId',
  auth(UserRole.USER),
  ReviewsController.getReview
);

export const ReviewsRoutes = router;