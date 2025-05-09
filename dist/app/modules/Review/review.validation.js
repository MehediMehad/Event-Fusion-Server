"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsValidation = void 0;
const zod_1 = require("zod");
const ratingValues = [1, 2, 3, 4, 5];
// Create review schema
const createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string({
            required_error: 'Event ID is required',
            invalid_type_error: 'Event ID must be a string'
        }),
        rating: zod_1.z
            .enum(ratingValues.map(String), {
            errorMap: () => ({
                message: 'Rating must be one of 1, 2, 3, 4, or 5'
            })
        })
            .transform(Number), // Convert to number if needed in service
        comment: zod_1.z
            .string()
            .max(1000, 'Comment cannot exceed 1000 characters')
            .optional()
            .nullable()
            .default(null)
    })
});
exports.ReviewsValidation = {
    createReviewSchema
};
