import { UserRole } from '@prisma/client';

export const userSearchAbleFields: string[] = ['email']; // only for search term

export const userFilterableFields: string[] = [
    'email',
    'role',
    'status',
    'searchTerm'
]; // for all filtering


export const USER_ROLE = {
    ADMIN: UserRole.ADMIN,
    DOCTOR: UserRole.DOCTOR,
    PATIENT: UserRole.PATIENT,
    SUPPER_ADMIN: UserRole.SUPPER_ADMIN
} as const;
