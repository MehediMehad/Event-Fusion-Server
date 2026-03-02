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
    USER: UserRole.USER
} as const;


export const DEMO_USER_EMAILS = {
    ADMIN: 'rakib@gmail.com',
    USER: 'niloy@gmail.com',
    ORGANIZER: 'tanvir@gmail.com'
}