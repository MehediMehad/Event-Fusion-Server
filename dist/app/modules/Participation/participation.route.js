"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const participation_controller_1 = require("./participation.controller");
const router = express_1.default.Router();
router.put('/status-update', (0, auth_1.default)("ADMIN", "USER"), participation_controller_1.ParticipationController.participationStatusUpdate);
exports.ParticipationRoutes = router;
