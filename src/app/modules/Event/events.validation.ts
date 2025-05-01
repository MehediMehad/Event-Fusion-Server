import { z } from 'zod';

const createEvents = z.object({
  organizerId: z.string({ required_error: 'organizerId is required' }),
  event: z.object({
    title: z.string({ required_error: 'title is required' }),
    description: z.string({ required_error: 'description is required' }),
    coverPhoto: z.string({ required_error: 'coverPhoto is required' }),
    date_time: z.string({ required_error: 'date_time is required' }),
    venue: z.string({ required_error: 'venue is required' }),
    location: z.string({ required_error: 'location is required' }),
    is_public: z.boolean().optional().default(true),
    is_paid: z.boolean().optional().default(false),
    registration_fee: z
      .number({ required_error: 'registration_fee is required' })
      .nonnegative({ message: 'registration_fee must be positive or zero' }),
    status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED'], {
      required_error: 'status is required',
    }).optional(),
  }),
});

export const EventsValidation = {
  createEvents,
};
