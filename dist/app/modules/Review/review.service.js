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
exports.ReviewsService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const APIError_1 = __importDefault(require("../../errors/APIError"));
const http_status_1 = __importDefault(require("http-status"));
const sendReview = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user || {};
    const { eventId, rating, comment } = req.body;
    if (!userId) {
        throw new APIError_1.default(http_status_1.default.UNAUTHORIZED, 'User not authenticated');
    }
    if (!eventId || !rating) {
        throw new APIError_1.default(http_status_1.default.BAD_REQUEST, 'Event ID and rating are required');
    }
    // Check if event exists
    const eventExists = yield prisma_1.default.events.findUnique({
        where: { id: eventId }
    });
    if (!eventExists) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    // Check if user has already reviewed this event
    const existingReview = yield prisma_1.default.review.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId
            }
        }
    });
    if (existingReview) {
        throw new APIError_1.default(http_status_1.default.CONFLICT, 'You have already reviewed this event');
    }
    // Create the review
    const review = yield prisma_1.default.review.create({
        data: {
            userId,
            eventId,
            rating,
            comment
        },
        include: {
            user: true,
            event: true
        }
    });
    return review;
});
// Get all reviews of an event + average rating
const getReview = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all reviews for this event
    const reviews = yield prisma_1.default.review.findMany({
        where: {
            eventId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
    if (!reviews.length) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'No reviews found for this event');
    }
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => {
        const ratingValue = Number(review.rating);
        return sum + ratingValue;
    }, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
    // Return enriched data
    return {
        reviews,
        averageRating,
        totalReviews: reviews.length
    };
});
const getMyReview = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield prisma_1.default.review.findMany({
        where: {
            userId
        },
        include: {
            event: {
                select: {
                    title: true,
                    location: true,
                    date_time: true,
                    coverPhoto: true,
                    is_paid: true,
                    is_public: true,
                    description: true
                }
            },
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
    return reviews;
});
const deleteReview = (userId, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the review exists and belongs to the user
    const review = yield prisma_1.default.review.findFirst({
        where: {
            id: reviewId,
            userId
        }
    });
    if (!review) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'Review not found or you are not authorized to delete this review');
    }
    // Delete the review
    yield prisma_1.default.review.delete({
        where: {
            id: reviewId
        }
    });
    return {
        message: 'Review deleted successfully'
    };
});
const updateReview = (reviewId, userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if review exists and belongs to user
    const existingReview = yield prisma_1.default.review.findFirst({
        where: {
            id: reviewId,
            userId
        }
    });
    if (!existingReview) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, 'Review not found or unauthorized');
    }
    // Update review
    const updatedReview = yield prisma_1.default.review.update({
        where: {
            id: reviewId
        },
        include: {
            event: true,
            user: true
        },
        data
    });
    return updatedReview;
});
exports.ReviewsService = {
    sendReview,
    getReview,
    getMyReview,
    deleteReview,
    updateReview
};
