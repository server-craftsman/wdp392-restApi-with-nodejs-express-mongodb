import bcryptjs from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IError } from '../../core/interfaces';
import { SearchPaginationResponseModel } from '../../core/models';
import { checkValidUrl, createTokenVerifiedUser, encodePasswordUserNormal, isEmptyObject } from '../../core/utils';
import { sendMail } from '../../core/utils/sendMail';
import ChangePasswordDto from './dtos/changePassword.dto';
import ChangeRoleDto from './dtos/changeRole.dto';
import ChangeStatusDto from './dtos/changeStatus.dto';
import RegisterDto from './dtos/register.dto';
import ReviewProfileDto from './dtos/reviewProfileDto';
import SearchPaginationUserDto from './dtos/searchPaginationUser.dto';
import SearchUserDto from './dtos/searchUser.dto';
import UpdateUserDto from './dtos/updateUser.dto';
import { UserReviewStatusEnum, UserRoleEnum } from './user.enum';
import { IUser } from './user.interface';
import UserSchema from './user.model';
import { StaffProfileSchema } from '../staff_profile';
// import { SubscriptionSchema } from '../subscription';
import { DataStoredInToken, UserInfoInTokenDefault } from '../auth';
import UserRepository from './user.repository';

export default class UserService {
    private userRepository = new UserRepository();
    public userSchema = UserSchema;
    // public subscriptionSchema = SubscriptionSchema;

    public async createUser(model: RegisterDto, isGoogle = false, isRegister = true): Promise<IUser> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        let newUser = {
            ...model,
            role: model.role || UserRoleEnum.CUSTOMER,
            google_id: model.google_id || '',
            phone_number: model.phone_number || '',
            avatar_url: model.avatar_url || '',
            token_version: 0,
        };

        if (newUser.avatar_url && !checkValidUrl(model.avatar_url)) {
            throw new HttpException(HttpStatus.BadRequest, `The URL '${model.avatar_url}' is not valid`);
        }

        if (isRegister && newUser.role === UserRoleEnum.ADMIN) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `You can only register with the Customer or Staff or Manager role!`,
            );
        }

        // create a new user by google
        if (isGoogle) {
            if (model.google_id) {
                newUser = await this.formatUserByGoogle(model.google_id, newUser);
            } else {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Field google_id via IdToken is empty, please send google_id!',
                );
            }
        }

        // check email duplicates
        const existingUserByEmail = await this.userRepository.findUserByEmail(newUser.email);
        if (existingUserByEmail) {
            throw new HttpException(HttpStatus.BadRequest, `Your email: '${newUser.email}' already exists!`);
        }

        // create a new user normal
        if (!isGoogle && model.password) {
            // handle encode password
            newUser.password = await encodePasswordUserNormal(model.password);
        }

        // send mail with token
        if (!newUser.is_verified && newUser.role !== UserRoleEnum.ADMIN) {
            let subject: string = 'Verify your email address';
            let content: string = `Hello, ${newUser.first_name} ${newUser.last_name}.`;

            // for customer, manager, staff
            if (newUser.role === UserRoleEnum.CUSTOMER || newUser.role === UserRoleEnum.MANAGER || newUser.role === UserRoleEnum.STAFF || newUser.role === UserRoleEnum.LABORATORY_TECHNICIAN) {
                // create token verification
                const tokenData = createTokenVerifiedUser();
                newUser.verification_token = tokenData.verification_token;
                newUser.verification_token_expires = tokenData.verification_token_expires;
                const domain = process.env.DOMAIN_FE;
                content = `${content}\nPlease click the following link to verify your email address:\n${domain}/verify-email/${tokenData.verification_token}`;
            }

            // // role MANAGER
            // if (newUser.role === UserRoleEnum.MANAGER) {
            //     subject = 'Register profile manager success';
            //     content = `${content}\nYou have successfully registered your profile for the manager role. Please wait for admin to review the application and notify you via email!`;
            // }

            const sendMailResult = await sendMail({
                toMail: newUser.email,
                subject: subject,
                content: content,
            });

            if (!sendMailResult) {
                throw new HttpException(HttpStatus.BadRequest, `Cannot send mail for ${newUser.email}`);
            }
        }

        const createdUser: IUser = await this.userRepository.createUser(newUser as IUser);
        if (!createdUser) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        const resultUser: IUser = createdUser.toObject(); // convert to plain object
        delete resultUser.password;
        return resultUser;
    }

    public async getUsers(model: SearchPaginationUserDto): Promise<SearchPaginationResponseModel<IUser>> {
        const searchCondition = { ...new SearchUserDto(), ...model.searchCondition };
        const { keyword, role, is_verified, status, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query: any = {
            role: { $ne: UserRoleEnum.ADMIN },
            is_deleted: is_deleted
        };

        if (keyword) {
            const keywordValue = keyword.toLowerCase().trim();
            query.$or = [
                { email: { $regex: keywordValue, $options: 'i' } },
                { first_name: { $regex: keywordValue, $options: 'i' } },
                { last_name: { $regex: keywordValue, $options: 'i' } },
            ];
        }

        if (role && role !== UserRoleEnum.ALL) {
            query.role = role;
        }

        if (is_verified !== '') {
            query.is_verified = is_verified;
        }

        if (status !== undefined) {
            query.status = status;
        }

        const resultQuery = await this.userRepository.getUsersWithStaffProfile(query, pageNum, pageSize);
        const rowCount = await this.userRepository.countUsers(query);

        const result = new SearchPaginationResponseModel<IUser>();
        result.pageInfo.pageNum = pageNum;
        result.pageInfo.pageSize = pageSize;
        if (rowCount > 0) {
            result.pageData = resultQuery;
            result.pageInfo.totalItems = rowCount;
            result.pageInfo.totalPages = Math.ceil(rowCount / pageSize);
        }

        return result;
    }

    public async getUserById(
        userId: string,
        is_deletedPassword = true,
        userData: DataStoredInToken = UserInfoInTokenDefault,
    ): Promise<IUser> {
        const user = await this.userRepository.findUserByIdWithStaffProfile(userId);
        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }

        if (user.role === UserRoleEnum.MANAGER || user.role === UserRoleEnum.STAFF) {
            user.is_verified = true;
        }

        if (is_deletedPassword) {
            delete user.password;
        }
        return user;
    }

    public async updateUser(userId: string, model: UpdateUserDto): Promise<IUser> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        // check user exits
        const item = await this.getUserById(userId);

        const errorResults: IError[] = [];

        if (model.dob) {
            const dobDate = new Date(model.dob);
            if (isNaN(dobDate.getTime())) {
                errorResults.push({
                    message: 'Please provide value with date type!',
                    field: 'dob',
                });
            }
        }

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const updateData = {
            first_name: model.first_name,
            last_name: model.last_name,
            phone_number: model.phone_number || item.phone_number,
            avatar_url: model.avatar_url || item.avatar_url,
            dob: model.dob || item.dob,
            address: model.address || item.address,
            gender: model.gender || item.gender,
            updated_at: new Date(),
        };

        const updateUserId = await this.userRepository.updateUser(userId, updateData as Partial<IUser>);

        if (!updateUserId) {
            throw new HttpException(HttpStatus.BadRequest, 'Update user info failed!');
        }

        const updateUser = await this.getUserById(userId);
        return updateUser;
    }

    public async changePassword(model: ChangePasswordDto): Promise<boolean> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const userId = model.user_id;

        // check user exits
        const user = await this.getUserById(userId, false);

        if (!user.password) {
            throw new HttpException(HttpStatus.BadRequest, `User created by google cannot change password.`);
        }

        // check old_password
        if (model.old_password) {
            const isMatchPassword = await bcryptjs.compare(model.old_password, user.password!);
            if (!isMatchPassword) {
                throw new HttpException(HttpStatus.BadRequest, `Your old password is not valid!`);
            }
        }

        // compare new_password vs old_password
        if (model.new_password === model.old_password) {
            throw new HttpException(HttpStatus.BadRequest, `New password and old password must not be the same!`);
        }

        // handle encode password
        const newPassword = await encodePasswordUserNormal(model.new_password);
        const updatePasswordUser = await this.userRepository.updatePassword(userId, newPassword);

        if (!updatePasswordUser) throw new HttpException(HttpStatus.BadRequest, 'Change password failed!');

        return true;
    }

    public async changeStatus(model: ChangeStatusDto): Promise<boolean> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const userId = model.user_id;

        // check user exits
        const user = await this.getUserById(userId);

        // check change status
        if (user.status === model.status) {
            throw new HttpException(HttpStatus.BadRequest, `User status is already ${model.status}`);
        }

        const updateUserId = await this.userRepository.updateStatus(userId, model.status);

        if (!updateUserId) {
            throw new HttpException(HttpStatus.BadRequest, 'Update user status failed!');
        }

        return true;
    }

    public async changeRole(model: ChangeRoleDto): Promise<boolean> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const userId = model.user_id;

        // check user exits
        const user = await this.getUserById(userId);

        // check change role
        if (user.role === model.role) {
            throw new HttpException(HttpStatus.BadRequest, `User role is already ${model.role}`);
        }

        const updateUserId = await this.userRepository.updateRole(userId, model.role);

        if (!updateUserId) {
            throw new HttpException(HttpStatus.BadRequest, 'Update user status failed!');
        }

        return true;
    }

    public async reviewProfileAccount(model: ReviewProfileDto): Promise<boolean> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const userId = model.user_id;

        // check user exits
        const user = await this.userRepository.findUserById(userId);

        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, 'User is not manager or staff or not exist or already verified!');
        }

        if (model.status === UserReviewStatusEnum.REJECT && !model.comment) {
            throw new HttpException(HttpStatus.BadRequest, 'Please enter reason reject profile manager or staff!');
        }

        // create token verification
        const tokenData = createTokenVerifiedUser();
        const domain = process.env.DOMAIN_FE;

        let subject: string = '';
        let content: string = `Hello, ${user.first_name} ${user.last_name}.`;

        if (model.status === UserReviewStatusEnum.APPROVE) {
            user.verification_token = tokenData.verification_token;
            user.verification_token_expires = tokenData.verification_token_expires;
            user.updated_at = new Date();
            subject = 'Register manager or staff success and verify your email address';
            content = `${content}\nYour manager or staff registration profile has been approved by admin.\nPlease click the following link to verify your email address:\n${domain}/verify-email/${tokenData.verification_token}`;
        } else {
            subject = 'Register manager or staff is rejected';
            content = `${content}\nYour manager or staff registration profile has been reject by admin.\nReason: '${model.comment}'.\nIf you have any questions please send email for admin!`;
        }

        const sendMailResult = await sendMail({
            toMail: user.email,
            subject,
            content,
        });

        if (!sendMailResult) {
            throw new HttpException(HttpStatus.BadRequest, `Cannot send mail for ${user.email}`);
        }

        const updateUserId = await user.save();
        if (!updateUserId) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot update user!');
        }

        return true;
    }

    public async deleteUser(userId: string): Promise<boolean> {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }

        const updateUserId = await this.userRepository.deleteUser(userId);

        if (!updateUserId) {
            throw new HttpException(HttpStatus.BadRequest, 'Delete item failed!');
        }

        return true;
    }

    // get user info from google by idToken, after get user info, format user info to RegisterDto
    private async formatUserByGoogle(google_id: string, newUser: RegisterDto): Promise<RegisterDto> {
        const client = new OAuth2Client();
        // check google_id is valid
        const ticket = await client.verifyIdToken({
            idToken: google_id,
        });
        // get user info from ticket
        const payload = ticket.getPayload();
        // If payload already exists, format user info to RegisterDto
        if (payload) {
            // newUser.last_name = newUser.first_name = payload.name!;
            newUser.first_name = payload.given_name!;
            newUser.last_name = payload.family_name!;
            newUser.email = payload.email!;
            newUser.avatar_url = payload.picture!;
            newUser.google_id = payload.sub!;
        }
        return newUser;
    }
}
