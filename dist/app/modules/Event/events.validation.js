"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsValidation = void 0;
const zod_1 = require("zod");
const createEvents = zod_1.z.object({
    organizerId: zod_1.z.string({ required_error: 'organizerId is required' }),
    event: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'title is required' }),
        description: zod_1.z.string({ required_error: 'description is required' }),
        date_time: zod_1.z.string({ required_error: 'date_time is required' }).refine((value) => {
            const eventDate = new Date(value);
            const now = new Date();
            return eventDate >= now;
        }, {
            message: 'date_time cannot be in the past'
        }),
        venue: zod_1.z.string({ required_error: 'venue is required' }),
        location: zod_1.z.string({ required_error: 'location is required' }),
        is_public: zod_1.z.boolean().optional().default(true),
        is_paid: zod_1.z.boolean().optional().default(false),
        registration_fee: zod_1.z
            .number({ required_error: 'registration_fee is required' })
            .nonnegative({
            message: 'registration_fee must be positive or zero'
        }),
        status: zod_1.z
            .enum(['UPCOMING', 'ONGOING', 'COMPLETED'], {
            required_error: 'status is required'
        })
            .optional()
    })
});
const updateEvent = zod_1.z.object({
    event: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'title is required' }).optional(),
        description: zod_1.z
            .string({ required_error: 'description is required' })
            .optional(),
        date_time: zod_1.z
            .string({ required_error: 'date_time is required' })
            .refine((value) => {
            const eventDate = new Date(value);
            const now = new Date();
            return eventDate >= now;
        }, {
            message: 'date_time cannot be in the past'
        })
            .optional(),
        venue: zod_1.z.string({ required_error: 'venue is required' }).optional(),
        location: zod_1.z
            .string({ required_error: 'location is required' })
            .optional(),
        is_public: zod_1.z.boolean().optional().default(true).optional(),
        is_paid: zod_1.z.boolean().optional().default(false).optional(),
        registration_fee: zod_1.z
            .number({ required_error: 'registration_fee is required' })
            .nonnegative({
            message: 'registration_fee must be positive or zero'
        })
            .optional(),
        status: zod_1.z
            .enum(['UPCOMING', 'ONGOING', 'COMPLETED'], {
            required_error: 'status is required'
        })
            .optional()
    })
});
const joinEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string({ required_error: 'eventId is required' }),
        paymentId: zod_1.z
            .string({ required_error: 'paymentId is required' })
            .optional(),
        payment_status: zod_1.z.enum(['FREE', 'COMPLETED', 'REFUNDED'], {
            required_error: 'payment_status is required',
            invalid_type_error: 'payment_status must be FREE, COMPLETED, or REFUNDED'
        })
    })
});
exports.EventsValidation = {
    createEvents,
    updateEvent,
    joinEventSchema
};
