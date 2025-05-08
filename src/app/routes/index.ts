import express from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { AuthRouter } from '../modules/Auth/auth.route';
import { EventRoutes } from '../modules/Event/events.route';
import { InvitationsRoutes } from '../modules/Invitation/invitation.route';

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

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
