"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationSValidation = void 0;
const zod_1 = require("zod");
const sendInviteUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiverId: zod_1.z.string({ message: "receiverId is required" }),
    }),
});
exports.InvitationSValidation = {
    sendInviteUserValidationSchema
};
