import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReviewsService } from './review.service';

const sendReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewsService.sendReview(req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review sent successfully!',
        data: result
    });
});

const getReview = catchAsync(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const result = await ReviewsService.getReview(eventId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review get successfully!',
        data: result
    });
});

export const ReviewsController = {
    sendReview,
    getReview
};
