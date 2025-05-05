import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync';
import { EventService } from './events.service';
import pick from '../../../shared/pick';
import { eventFilterableFields } from './event.constants';

const createEvent = catchAsync(async (req: Request, res: Response) => {
    const result = await EventService.createEvent(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event created successfully!',
        data: result
    });
});

const getAllUpcomingEvent = catchAsync(async (req: Request, res: Response) => {
    const result = await EventService.getAllUpcomingEvent();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event created successfully!',
        data: result
    });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EventService.getByIdFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event retrieval successfully',
        data: result
    });
});

const getAllEventsFromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await EventService.getAllEventsFromDB(options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My Event retrieval successfully',
        data: result
    });
});

// Event Details Page
const getAllEventsDetailsPage = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, eventFilterableFields) 
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await EventService.getAllEventsDetailsPage(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My Events retrieval successfully',
        data: result
    });
});


const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EventService.updateIntoDB(req, id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event data updated!',
        data: result
    });
});


export const EventsController = {
    createEvent,
    getAllUpcomingEvent,
    getByIdFromDB,
    updateIntoDB,
    getAllEventsFromDB,
    getAllEventsDetailsPage
};
