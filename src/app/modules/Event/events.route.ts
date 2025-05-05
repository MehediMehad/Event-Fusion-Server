import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../../helpers/fileUploader';
import { EventsValidation } from './events.validation';
import { USER_ROLE } from '../User/user.constant';
import { EventsController } from './events.controller';

const router = express.Router();

router.get('/', EventsController.getAllUpcomingEvent);
router.get('/all-details', EventsController.getAllEventsDetailsPage);
// get my events
router.get(
    '/my-events',
    // auth('USER', 'ADMIN'),
    EventsController.getAllEventsFromDB
);

// getSingleEvent
router.get('/:id', EventsController.getByIdFromDB);

router.post(
    '/',
    auth(USER_ROLE.USER),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = EventsValidation.createEvents.parse(
            JSON.parse(req.body.data)
        );
        return EventsController.createEvent(req, res, next);
    }
);

router.put(
    '/:id',
    auth(USER_ROLE.USER),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = EventsValidation.updateEvent.parse(
            JSON.parse(req.body.data)
        );
        return EventsController.updateIntoDB(req, res, next);
    }
);

export const EventRoutes = router;
