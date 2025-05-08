import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { InvitationsService } from './invitation.service';
import { catchAsync } from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import ApiError from '../../errors/APIError';

const sendInviteUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { receiverId } = req.body;
    const { eventId } = req.params;
    if (!eventId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'eventId not found');
    }

    const result = await InvitationsService.sendInviteUser(
        { receiverId, eventId },
        userId
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Invitation sent successfully!',
        data: result
    });
});

export const InvitationsController = {
    sendInviteUser
};
