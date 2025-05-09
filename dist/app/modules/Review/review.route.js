"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const validateRequest_1 = require("../../middlewares/validateRequest");
const review_validation_1 = require("./review.validation");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(client_1.UserRole.USER), (0, validateRequest_1.validateRequest)(review_validation_1.ReviewsValidation.createReviewSchema), review_controller_1.ReviewsController.sendReview);
router.get('/:eventId', (0, auth_1.default)(client_1.UserRole.USER), review_controller_1.ReviewsController.getReview);
exports.ReviewsRoutes = router;
