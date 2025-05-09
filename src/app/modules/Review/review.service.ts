import prisma from "../../../shared/prisma";
import { Request } from 'express';
import ApiError from "../../errors/APIError";
import httpStatus from 'http-status';


const sendReview = async (req: Request) => {
  const { userId } = req.user || {};
  const { eventId, rating, comment } = req.body;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  if (!eventId || !rating) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Event ID and rating are required');
  }

  // Check if event exists
  const eventExists = await prisma.events.findUnique({
    where: { id: eventId },
  });

  if (!eventExists) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  // Check if user has already reviewed this event
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (existingReview) {
    throw new ApiError(httpStatus.CONFLICT, 'You have already reviewed this event');
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      userId,
      eventId,
      rating,
      comment,
    },
    include: {
      user: true,
      event: true,
    },
  });

  return review;
};

export const ReviewsService = {
  sendReview,
};