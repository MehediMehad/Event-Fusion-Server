"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const registration = zod_1.z.object({
    password: zod_1.z.string({ required_error: 'password is required' }),
    name: zod_1.z.string({ required_error: 'name is required' }),
    email: zod_1.z
        .string({ required_error: 'email is required' })
        .email({ message: 'provide a valid email' }),
    contactNumber: zod_1.z
        .string({ required_error: 'contact number is required' })
        .regex(/^\d+$/, { message: 'Contact number must be a number' })
        .min(10, { message: 'Contact number must be at least 10 digits' })
        .max(15, { message: 'Contact number must be at most 15 digits' }),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER'], {
        required_error: 'gender is required',
        invalid_type_error: 'gender must be MALE, FEMALE, or OTHER'
    }),
    profilePhoto: zod_1.z.string().optional()
});
const updateProfile = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email({ message: 'Provide a valid email' }).optional(),
    contactNumber: zod_1.z
        .string()
        .regex(/^\d+$/, { message: 'Contact number must be numeric' })
        .min(10, { message: 'Contact number must be at least 10 digits' })
        .max(15, { message: 'Contact number must be at most 15 digits' })
        .optional(),
    profilePhoto: zod_1.z.string().optional(),
    gender: zod_1.z.nativeEnum(client_1.Gender).optional()
});
const updateStatus = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.UserStatus).refine((val) => Object.values(client_1.UserStatus).includes(val), (val) => ({
            message: `Invalid status value: '${val}', expected one of [${Object.values(client_1.UserStatus).join(', ')}]`
        }))
    })
});
exports.UserValidation = {
    registration,
    updateStatus,
    updateProfile
};
