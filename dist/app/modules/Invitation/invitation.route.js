"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = require("../../middlewares/validateRequest");
const invitation_controller_1 = require("./invitation.controller");
const invitation_validation_1 = require("./invitation.validation");
const router = express_1.default.Router();
router.get('/my-pending-notification', (0, auth_1.default)('ADMIN', 'USER'), invitation_controller_1.InvitationsController.myPendingNotification);
router.get('/get-notification', (0, auth_1.default)('ADMIN', 'USER'), invitation_controller_1.InvitationsController.getNotification);
router.post('/:eventId/invite', (0, auth_1.default)('ADMIN', 'USER'), (0, validateRequest_1.validateRequest)(invitation_validation_1.InvitationSValidation.sendInviteUserValidationSchema), invitation_controller_1.InvitationsController.sendInviteUser);
router.put('/respond', (0, auth_1.default)('ADMIN', 'USER'), invitation_controller_1.InvitationsController.acceptDeclineInvitation);
exports.InvitationsRoutes = router;
