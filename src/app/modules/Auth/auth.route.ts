import express from 'express';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post('/login', AuthController.loginUser);
router.post('/refresh-token', AuthController.refreshToken);
router.post(
    '/change-password',
    auth('ADMIN', 'USER'),
    AuthController.changePassword
);

router.post('/forgot-password', AuthController.forgotPassword);

router.post('/reset-password', AuthController.resetPassword);

export const AuthRouter = router;
