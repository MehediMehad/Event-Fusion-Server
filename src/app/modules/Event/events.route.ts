import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../../helpers/fileUploader';
import { EventsValidation } from './events.validation';
import { USER_ROLE } from '../User/user.constant';
import { EventsController } from './events.controller';

const router = express.Router();
// getSingleEvent
router.get(
    '/',
    EventsController.getAllUpcomingEvent
);

router.get(
    '/:id',
    EventsController.getByIdFromDB
);

router.get(
    '/upcoming',
    EventsController.getUpcomingLastEvent
);



router.post(
    '/',
    auth(USER_ROLE.USER),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = EventsValidation.createEvents.parse(JSON.parse(req.body.data));
        return EventsController.createEvent(req, res, next);
    }
);


// router.patch(
//     '/:id/status',
//     auth(USER_ROLE.SUPPER_ADMIN, USER_ROLE.ADMIN),
//     validateRequest(UserValidation.updateStatus),
//     UserController.changeProfileStatus
// )


export const EventRoutes = router;