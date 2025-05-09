import express from 'express';
import { ReviewsController } from './review.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.USER),
  ReviewsController.sendReview
);

export const ReviewsRoutes = router;