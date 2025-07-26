import { NextFunction, Request, Response } from 'express';
import { API_PATH } from '../../core/constants';
import { HttpStatus } from '../../core/enums';
import { SearchPaginationResponseModel } from '../../core/models';
import { formatResponse } from '../../core/utils';
import ChangePasswordDto from './dtos/changePassword.dto';
import ChangeRoleDto from './dtos/changeRole.dto';
import ChangeStatusDto from './dtos/changeStatus.dto';
import RegisterDto from './dtos/register.dto';
import SearchPaginationUserDto from './dtos/searchPaginationUser.dto';
import UpdateUserDto from './dtos/updateUser.dto';
import { UserRoleEnum } from './user.enum';
import { IUser } from './user.interface';
import UserService from './user.service';
import ReviewProfileDto from './dtos/reviewProfileDto';
import { HttpException } from '../../core/exceptions';
import { DataStoredInToken, UserInfoInTokenDefault } from '../auth';

export default class UserController {
    private userService = new UserService();

    public generateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model = new RegisterDto(
                '',
                'Tôi là',
                'Admin',
                'admin@bloodline.com', // email admin
                'BloodlineAdmin@6969', // password admin
                UserRoleEnum.ADMIN,
                true,
                869872830,
                '',
                new Date(),
                {
                    street: 'đường Hoàng Hữu Nam',
                    ward: 'Phường Long Thạnh Mỹ',
                    district: 'Quận 9',
                    city: 'Hồ Chí Minh',
                    country: 'Việt Nam',
                },
                '',
                true,
                '',
                new Date(),
                0,
                new Date(),
                new Date(),
                false,
            );
            const user: IUser = await this.userService.createUser(model, false, false);
            res.status(HttpStatus.Created).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: RegisterDto = req.body;
            const file = req.file; // Get the uploaded file from multer
            const routerPath = req.route.path;
            const isGoogle = routerPath === API_PATH.USERS_GOOGLE;
            const isRegister = !(routerPath === API_PATH.CREATE_USERS);

            const user: IUser = await this.userService.createUser(model, isGoogle, isRegister, file);
            res.status(HttpStatus.Created).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: SearchPaginationUserDto = req.body;
            const result: SearchPaginationResponseModel<IUser> = await this.userService.getUsers(model);
            res.status(HttpStatus.Success).json(formatResponse<SearchPaginationResponseModel<IUser>>(result));
        } catch (error) {
            next(error);
        }
    };

    public getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user: IUser = await this.userService.getUserById(req.params.id, true, req.user);
            res.status(HttpStatus.Success).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ChangePasswordDto = req.body;
            await this.userService.changePassword(model);
            res.status(HttpStatus.Success).json(formatResponse<string>('Change password successfully'));
        } catch (error) {
            next(error);
        }
    };

    public changeStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ChangeStatusDto = req.body;
            await this.userService.changeStatus(model);
            res.status(HttpStatus.Success).json(formatResponse<string>('Change status successfully'));
        } catch (error) {
            next(error);
        }
    };

    public changeRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ChangeRoleDto = req.body;
            await this.userService.changeRole(model);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public reviewProfileAccount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: ReviewProfileDto = req.body;
            await this.userService.reviewProfileAccount(model);
            res.status(HttpStatus.Success).json(formatResponse<string>('Review profile account successfully'));
        } catch (error) {
            next(error);
        }
    };

    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: UpdateUserDto = req.body;
            const file = req.file; // Get the uploaded file from multer
            const user: IUser = await this.userService.updateUser(req.params.id, model, file);
            res.status(HttpStatus.Success).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.userService.deleteUser(req.params.id);
            res.status(HttpStatus.Success).json(formatResponse<string>('Delete user successfully'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get staff and laboratory technician users
     */
    public getStaffAndLabTechUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user.role;
            if (userRole !== UserRoleEnum.MANAGER && userRole !== UserRoleEnum.ADMIN) {
                throw new HttpException(HttpStatus.Forbidden, 'Only Admin and Managers can view staff and laboratory technician users');
            }

            const users = await this.userService.getStaffAndLabTechUsers();
            res.status(HttpStatus.Success).json(formatResponse<any[]>(users));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Search customer by phone number or email (for staff convenience)
     */
    public searchCustomerByPhoneOrEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            const { searchTerm } = req.query;
            const userData: DataStoredInToken = (req.user as DataStoredInToken) || UserInfoInTokenDefault;

            // Check if user has permission (staff, manager, admin)
            if (![UserRoleEnum.STAFF, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN].includes(userData.role as UserRoleEnum)) {
                throw new HttpException(HttpStatus.Forbidden, 'Access denied. Staff, Manager, or Admin access required.');
            }

            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new HttpException(HttpStatus.BadRequest, 'Search term is required');
            }

            const customer = await this.userService.searchCustomerByPhoneOrEmail(searchTerm);

            if (!customer) {
                res.status(HttpStatus.NotFound).json(formatResponse<null>(null, false, 'Customer not found'));
                return;
            }

            res.status(HttpStatus.Success).json(formatResponse<IUser>(customer, true, 'Customer found successfully'));
        } catch (error) {
            console.error('Error in searchCustomerByPhoneOrEmail:', error);
            if (error instanceof HttpException) {
                res.status(error.status).json(formatResponse<string>(error.message, false));
            } else {
                res.status(HttpStatus.InternalServerError).json(formatResponse<string>('Internal server error', false, error instanceof Error ? error.message : 'Unknown error'));
            }
        }
    };
}
