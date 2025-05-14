import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import ChangePasswordDto from './dtos/changePassword.dto';
import ChangeStatusDto from './dtos/changeStatus.dto';
import RegisterDto from './dtos/register.dto';
import SearchPaginationUserDto from './dtos/searchPaginationUser.dto';
import UpdateUserDto from './dtos/updateUser.dto';
import UserController from './user.controller';
import { UserRoleEnum } from './user.enum';
import ChangeRoleDto from './dtos/changeRole.dto';
import ReviewProfileInstructorDto from './dtos/reviewProfileInstructorDto';

export default class UserRoute implements IRoute {
    public path = API_PATH.USERS;
    public router = Router();
    public userController = new UserController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/users/seed -> Create admin user default
        this.router.post(API_PATH.GENERATE_USERS, this.userController.generateUser);

        // POST domain:/api/users -> Register normal user
        this.router.post(this.path, validationMiddleware(RegisterDto), this.userController.register);

        // POST domain:/api/users/google -> Register google user
        this.router.post(API_PATH.USERS_GOOGLE, this.userController.register);

        // POST domain:/api/users -> Create normal user
        this.router.post(
            API_PATH.CREATE_USERS,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(RegisterDto),
            this.userController.register,
        );

        // POST domain:/api/users/search -> Get all users includes params: keyword, status, role
        this.router.post(
            API_PATH.SEARCH_USERS,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(SearchPaginationUserDto),
            this.userController.getUsers,
        );

        // GET domain:/api/users/:id -> Get user by id
        this.router.get(`${this.path}/:id`, authMiddleWare([], true), this.userController.getUserById);

        // PUT domain:/api/users/change-password -> Change password
        this.router.put(
            API_PATH.CHANGE_PASSWORD_USERS,
            authMiddleWare(),
            validationMiddleware(ChangePasswordDto),
            this.userController.changePassword,
        );

        // PUT domain:/api/users/change-status -> Change user status (block/unBlock)
        this.router.put(
            API_PATH.CHANGE_STATUS_USERS,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(ChangeStatusDto),
            this.userController.changeStatus,
        );

        // PUT domain:/api/users/change-role -> Change user role
        this.router.put(
            API_PATH.CHANGE_ROLE_USER,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(ChangeRoleDto),
            this.userController.changeRole,
        );

        // PUT domain:/api/users/review-profile-instructor -> Review profile instructor
        this.router.put(
            API_PATH.REVIEW_PROFILE_INSTRUCTOR,
            authMiddleWare([UserRoleEnum.ADMIN]),
            validationMiddleware(ReviewProfileInstructorDto),
            this.userController.reviewProfileInstructor,
        );

        // PUT domain:/api/users/:id -> Update user
        this.router.put(
            `${this.path}/:id`,
            authMiddleWare(),
            validationMiddleware(UpdateUserDto),
            this.userController.updateUser,
        );

        // POST domain:/api/users/:id -> Delete user logic
        this.router.delete(`${this.path}/:id`, authMiddleWare([UserRoleEnum.ADMIN]), this.userController.deleteUser);
    }
}
