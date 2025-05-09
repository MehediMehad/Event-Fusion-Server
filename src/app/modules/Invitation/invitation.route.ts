import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { validateRequest } from '../../middlewares/validateRequest';
import { InvitationsController } from './invitation.controller';
import { InvitationSValidation } from './invitation.validation';

const router = express.Router();

router.get('/notification',
    auth("ADMIN","USER"),
    InvitationsController.notification
)

router.post('/:eventId/invite', 
    auth("ADMIN", "USER"),
    validateRequest(InvitationSValidation.sendInviteUserValidationSchema),
    InvitationsController.sendInviteUser);



export const InvitationsRoutes = router;
