import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync';
import { EventService } from './events.service';

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
      data: result,
    });
  });

const getMyEventsFromDB = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId    
    const result = await EventService.getMyEventsFromDB(userId);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My Event retrieval successfully',
      data: result,
    });
  });

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    const result = await EventService.updateIntoDB(req, id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Event data updated!",
        data: result
    })
});


export const EventsController = {
    createEvent,
    getAllUpcomingEvent,
    getByIdFromDB,
    updateIntoDB,
    getMyEventsFromDB
};
