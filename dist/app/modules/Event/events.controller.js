"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../../shared/catchAsync");
const events_service_1 = require("./events.service");
const pick_1 = __importDefault(require("../../../shared/pick"));
const event_constants_1 = require("./event.constants");
const createEvent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield events_service_1.EventService.createEvent(req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Event created successfully!',
        data: result
    });
}));
const getAllUpcomingEvent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield events_service_1.EventService.getAllUpcomingEvent();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Event created successfully!',
        data: result
    });
}));
const getByIdFromDB = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield events_service_1.EventService.getByIdFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Event retrieval successfully',
        data: result
    });
}));
const getMyEventsFromDB = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const result = yield events_service_1.EventService.getMyEventsFromDB(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'My Event retrieval successfully',
        data: result
    });
}));
// Event Details Page
const getAllEventsDetailsPage = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, event_constants_1.eventFilterableFields);
    const options = (0, pick_1.default)(req.query, [
        'limit',
        'page',
        'sortBy',
        'sortOrder'
    ]);
    const result = yield events_service_1.EventService.getAllEventsDetailsPage(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Events retrieval successfully',
        data: result
    });
}));
const updateIntoDB = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield events_service_1.EventService.updateIntoDB(req, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Event data updated!',
        data: result
    });
}));
const addHeroSection = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.body;
    const result = yield events_service_1.EventService.addHeroSection(eventId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Event data updated!',
        data: result
    });
}));
const joinEvent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield events_service_1.EventService.joinEvent(req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Join Event successfully!',
        data: result
    });
}));
const deleteEvent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const result = yield events_service_1.EventService.deleteEvent(eventId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Event deleted successfully!',
        data: result
    });
}));
exports.EventsController = {
    createEvent,
    getAllUpcomingEvent,
    getByIdFromDB,
    updateIntoDB,
    addHeroSection,
    getMyEventsFromDB,
    getAllEventsDetailsPage,
    joinEvent,
    deleteEvent
};
