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
exports.ParticipationService = void 0;
const APIError_1 = __importDefault(require("../../errors/APIError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const client_1 = require("@prisma/client");
const participationStatusUpdate = (userId, eventId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if status is valid
    if (!Object.values(client_1.ParticipationStatus).includes(status)) {
        throw new APIError_1.default(http_status_1.default.BAD_REQUEST, `Invalid status. Allowed values: ${Object.values(client_1.ParticipationStatus).join(', ')}`);
    }
    // Convert string to enum
    const enumStatus = status;
    // Check if participation exists
    const existingParticipation = yield prisma_1.default.participation.findUnique({
        where: {
            userId_eventId: {
                userId,
                eventId
            }
        }
    });
    if (!existingParticipation) {
        throw new APIError_1.default(http_status_1.default.NOT_FOUND, "Participation not found");
    }
    // Update the status
    const updatedParticipation = yield prisma_1.default.participation.update({
        where: {
            userId_eventId: {
                userId,
                eventId
            }
        },
        data: {
            status: enumStatus
        }
    });
    return updatedParticipation;
});
exports.ParticipationService = {
    participationStatusUpdate
};
