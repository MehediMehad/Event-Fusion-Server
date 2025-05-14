"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = require("../modules/User/user.routes");
const auth_route_1 = require("../modules/Auth/auth.route");
const events_route_1 = require("../modules/Event/events.route");
const invitation_route_1 = require("../modules/Invitation/invitation.route");
const review_route_1 = require("../modules/Review/review.route");
const participation_route_1 = require("../modules/Participation/participation.route");
const payment_routes_1 = require("../modules/payment/payment.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/user',
        route: user_routes_1.UserRoutes
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRouter
    },
    {
        path: '/event',
        route: events_route_1.EventRoutes
    },
    {
        path: '/invite',
        route: invitation_route_1.InvitationsRoutes
    },
    {
        path: '/review',
        route: review_route_1.ReviewsRoutes
    },
    {
        path: '/participation',
        route: participation_route_1.ParticipationRoutes
    },
    {
        path: '/payment',
        route: payment_routes_1.PaymentRoutes
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
