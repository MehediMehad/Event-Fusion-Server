"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const events_validation_1 = require("./events.validation");
const user_constant_1 = require("../User/user.constant");
const events_controller_1 = require("./events.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const router = express_1.default.Router();
router.get('/', events_controller_1.EventsController.getAllUpcomingEvent);
router.get('/all-details', events_controller_1.EventsController.getAllEventsDetailsPage);
router.get('/my-events', (0, auth_1.default)('USER', 'ADMIN'), events_controller_1.EventsController.getMyEventsFromDB);
router.get('/:id', events_controller_1.EventsController.getByIdFromDB);
router.post('/', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = events_validation_1.EventsValidation.createEvents.parse(JSON.parse(req.body.data));
    return events_controller_1.EventsController.createEvent(req, res, next);
});
router.put('/add-to-hero-section', (0, auth_1.default)("ADMIN", "USER"), events_controller_1.EventsController.addHeroSection);
router.put('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = events_validation_1.EventsValidation.updateEvent.parse(JSON.parse(req.body.data));
    return events_controller_1.EventsController.updateIntoDB(req, res, next);
});
router.post('/join-event', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), (0, validateRequest_1.validateRequest)(events_validation_1.EventsValidation.joinEventSchema), events_controller_1.EventsController.joinEvent);
router.delete('/:id', (0, auth_1.default)('ADMIN', 'USER'), events_controller_1.EventsController.deleteEvent);
exports.EventRoutes = router;
