import { Gender, UserStatus } from '@prisma/client';
import { z } from 'zod';

const registration = z.object({
    password: z.string({ required_error: 'password is required' }),
    user: z.object({
      name: z.string({ required_error: 'name is required' }),
      email: z
        .string({ required_error: 'email is required' })
        .email({ message: 'provide a valid email' }),
      contactNumber: z
        .string({ required_error: 'contact number is required' })
        .regex(/^\d+$/, { message: 'Contact number must be a number' })
        .min(10, { message: 'Contact number must be at least 10 digits' })
        .max(15, { message: 'Contact number must be at most 15 digits' }),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
        required_error: 'gender is required',
        invalid_type_error: 'gender must be MALE, FEMALE, or OTHER',
      }),
      profilePhoto: z.string().optional(),
    }),
  });

const createDoctor = z.object({
    password: z.string({
        required_error: 'Password is required'
    }),
    doctor: z.object({
        name: z.string({
            required_error: 'Name is required!'
        }),
        email: z.string({
            required_error: 'Email is required!'
        }),
        contactNumber: z.string({
            required_error: 'Contact Number is required!'
        }),
        address: z.string().optional(),
        registrationNumber: z.string({
            required_error: 'Registration number is required'
        }),
        experience: z.number().optional(),
        gender: z.nativeEnum(Gender).refine(
            (val) => Object.values(Gender).includes(val),
            (val) => ({
                message: `Invalid gender value: '${val}', expected one of [${Object.values(
                    Gender
                ).join(', ')}]`
            })
        ),
        appointmentFee: z.number({
            required_error: 'appointmentFee is required'
        }),
        qualification: z.string({
            required_error: 'qualification is required'
        }),
        currentWorkingPlace: z.string({
            required_error: 'Current working place is required!'
        }),
        designation: z.string({
            required_error: 'Designation is required!'
        })
    })
});

const createPatient = z.object({
    password: z.string(),
    patient: z.object({
        email: z
            .string({
                required_error: 'Email is required!'
            })
            .email(),
        name: z.string({
            required_error: 'Name is required!'
        }),
        contactNumber: z.string({
            required_error: 'Contact number is required!'
        }),
        address: z.string({
            required_error: 'Address is required'
        })
    })
});

const updateStatus = z.object({
    body: z.object({
        status: z.nativeEnum(UserStatus).refine(
            (val) => Object.values(UserStatus).includes(val),
            (val) => ({
                message: `Invalid status value: '${val}', expected one of [${Object.values(
                    UserStatus
                ).join(', ')}]`
            })
        )
    })
});

export const UserValidation = {
    registration,
    createDoctor,
    createPatient,
    updateStatus
};
