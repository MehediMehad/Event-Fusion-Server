import express from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { AuthRouter } from '../modules/Auth/auth.route';
import { EventRoutes } from '../modules/Event/events.route';
import { InvitationsRoutes } from '../modules/Invitation/invitation.route';
import { ReviewsRoutes } from '../modules/Review/review.route';
import { ParticipationRoutes } from '../modules/Participation/participation.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRouter
    },
    {
        path: '/event',
        route: EventRoutes
    },
    {
        path: '/invite',
        route: InvitationsRoutes
    },
    {
        path: '/review',
        route: ReviewsRoutes
    },
    {
        path: '/participation',
        route: ParticipationRoutes
    }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
