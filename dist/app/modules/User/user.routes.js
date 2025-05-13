"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const user_validation_1 = require("./user.validation");
const user_constant_1 = require("./user.constant");
const validateRequest_1 = require("../../middlewares/validateRequest");
const router = express_1.default.Router();
router.get('/', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), user_controller_1.UserController.getAllFromDB);
router.get('/non-participants/:eventId', 
// auth("ADMIN", "USER"),
user_controller_1.UserController.getNonParticipants);
router.post('/registration', fileUploader_1.fileUploader.upload.single('file'), (req, res, next) => {
    req.body = user_validation_1.UserValidation.registration.parse(JSON.parse(req.body.data));
    return user_controller_1.UserController.registrationNewUser(req, res, next);
});
router.put('/update-profile', fileUploader_1.fileUploader.upload.single('file'), (0, auth_1.default)("ADMIN", "USER"), (req, res, next) => {
    req.body = user_validation_1.UserValidation.updateProfile.parse(JSON.parse(req.body.data));
    return user_controller_1.UserController.updateUserProfile(req, res, next);
});
router.patch('/:id/status', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), (0, validateRequest_1.validateRequest)(user_validation_1.UserValidation.updateStatus), user_controller_1.UserController.changeProfileStatus);
router.get('/me', (0, auth_1.default)('ADMIN', 'USER'), user_controller_1.UserController.getMyInfo);
router.get('/get-my-dashboard-info', (0, auth_1.default)('ADMIN', 'USER'), user_controller_1.UserController.getMyDashboardInfo);
router.get('/get-admin-dashboard-info', (0, auth_1.default)('ADMIN', 'USER'), user_controller_1.UserController.getAdminDashboardInfo);
router.get('/admin/users', user_controller_1.UserController.getAllUsersWithStats);
exports.UserRoutes = router;
