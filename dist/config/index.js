"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        expires_in: process.env.EXPIRES_IN, // "5m"
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN // "30d"
    },
    reset_password: {
        secret_token: process.env.RESET_PASSWORD_TOKEN,
        expires_in: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN, // "5m"
        link: process.env.RESET_PASSWORD_LINK // "http://localhost:3000/reset-pass"
    },
    node_mailer: {
        email: process.env.NODE_MAILER_EMAIL,
        app_password: process.env.NODE_MAILER_APP_PASSWORD
    },
    // Cloudinary
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
};
