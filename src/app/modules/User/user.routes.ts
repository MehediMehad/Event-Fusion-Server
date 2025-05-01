import express, { NextFunction, Request, Response } from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../../helpers/fileUploader';
import { UserValidation } from './user.validation';
import { USER_ROLE } from './user.constant';
import { validateRequest } from '../../middlewares/validateRequest';

const router = express.Router();

router.get(
    '/',
    auth(USER_ROLE.SUPPER_ADMIN, USER_ROLE.ADMIN),
    UserController.getAllFromDB
);

router.post(
    '/registration',
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.registration.parse(JSON.parse(req.body.data));
        return UserController.registrationNewUser(req, res, next);
    }
);

router.patch(
    '/:id/status',
    auth(USER_ROLE.SUPPER_ADMIN, USER_ROLE.ADMIN),
    validateRequest(UserValidation.updateStatus),
    UserController.changeProfileStatus
)


export const UserRoutes = router;
