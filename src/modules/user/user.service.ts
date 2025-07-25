import bcryptjs from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IError } from '../../core/interfaces';
import { SearchPaginationResponseModel } from '../../core/models';
import { checkValidUrl, createTokenVerifiedUser, encodePasswordUserNormal, isEmptyObject, sendMail, createVerificationEmailTemplate } from '../../core/utils';
import { uploadFileToS3, s3Folders } from '../../core/utils/s3Upload';
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
import { StaffProfileSchema, StaffStatusEnum } from '../staff_profile';
// import { SubscriptionSchema } from '../subscription';
import { DataStoredInToken, UserInfoInTokenDefault } from '../auth';
import UserRepository from './user.repository';
import AdministrativeCaseSchema from '../administrative_cases/administrative_cases.model';

export default class UserService {
    private userRepository = new UserRepository();
    public userSchema = UserSchema;
    // public subscriptionSchema = SubscriptionSchema;

    public async createUser(model: RegisterDto, isGoogle = false, isRegister = true, avatarFile?: Express.Multer.File): Promise<IUser> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        if (typeof model.address === 'string') {
            model.address = JSON.parse(model.address);
        }
        const addressObj = model.address || {};
        let newUser = {
            ...model,
            address: {
                street: addressObj.street || '',
                ward: addressObj.ward || '',
                district: addressObj.district || '',
                city: addressObj.city || '',
                country: addressObj.country || 'Việt Nam',
            },
            role: model.role || UserRoleEnum.CUSTOMER,
            google_id: model.google_id || '',
            phone_number: model.phone_number || 0,
            avatar_url: model.avatar_url || '',
            token_version: 0,
        };

        // Handle avatar file upload if provided
        if (avatarFile) {
            try {
                // Upload to S3 and get the URL
                const avatarUrl = await uploadFileToS3(avatarFile, undefined, s3Folders.personImages);
                newUser.avatar_url = avatarUrl;
            } catch (error) {
                console.error('Error uploading avatar to S3:', error);
                throw new HttpException(HttpStatus.BadRequest, 'Failed to upload avatar image');
            }
        } else if (newUser.avatar_url && !checkValidUrl(model.avatar_url)) {
            throw new HttpException(HttpStatus.BadRequest, `The URL '${model.avatar_url}' is not valid`);
        }

        if (isRegister && newUser.role === UserRoleEnum.ADMIN) {
            throw new HttpException(HttpStatus.BadRequest, `You can only register with the Customer or Staff or Manager role!`);
        }

        // create a new user by google
        if (isGoogle) {
            if (model.google_id) {
                newUser = await this.formatUserByGoogle(model.google_id, newUser);
            } else {
                throw new HttpException(HttpStatus.BadRequest, 'Field google_id via IdToken is empty, please send google_id!');
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
            let htmlContent: string = '';

            // for customer, manager, staff
            if (newUser.role === UserRoleEnum.CUSTOMER || newUser.role === UserRoleEnum.MANAGER || newUser.role === UserRoleEnum.STAFF || newUser.role === UserRoleEnum.LABORATORY_TECHNICIAN) {
                // create token verification
                const tokenData = createTokenVerifiedUser();
                newUser.verification_token = tokenData.verification_token;
                newUser.verification_token_expires = tokenData.verification_token_expires;
                const domain = process.env.DOMAIN_FE;
                const verificationLink = `${domain}/verify-email/${tokenData.verification_token}`;
                content = `${content}\nPlease click the following link to verify your email address:\n${verificationLink}`;

                // Generate HTML template for email
                const userName = `${newUser.first_name} ${newUser.last_name}`;
                htmlContent = createVerificationEmailTemplate(userName, verificationLink);
            }

            const sendMailResult = await sendMail({
                toMail: newUser.email,
                subject: subject,
                content: content,
                html: htmlContent,
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
            is_deleted: is_deleted,
        };

        if (keyword) {
            const keywordValue = keyword.toLowerCase().trim();
            query.$or = [{ email: { $regex: keywordValue, $options: 'i' } }, { first_name: { $regex: keywordValue, $options: 'i' } }, { last_name: { $regex: keywordValue, $options: 'i' } }];
        }

        // Handle role filtering with array support
        if (role && Array.isArray(role) && role.length > 0) {
            // Filter out 'all' role if present
            const filteredRoles = role.filter((r) => r !== UserRoleEnum.ALL);

            // Only apply role filter if there are specific roles to filter by
            if (filteredRoles.length > 0) {
                query.role = { $in: filteredRoles };
            }
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

    public async getUserById(userId: string, is_deletedPassword = true, userData: DataStoredInToken = UserInfoInTokenDefault): Promise<IUser & { administrative_cases?: any[] }> {
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
        // Lấy các administrative cases mà user là applicant_id
        const administrative_cases = await AdministrativeCaseSchema.find({ applicant_id: userId });
        user.administrative_cases = administrative_cases;
        return user;
    }

    public async updateUser(userId: string, model: UpdateUserDto, avatarFile?: Express.Multer.File): Promise<IUser> {
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

        // Handle avatar file upload if provided
        let avatarUrl = model.avatar_url || item.avatar_url;
        if (avatarFile) {
            try {
                // Upload to S3 and get the URL
                avatarUrl = await uploadFileToS3(avatarFile, undefined, s3Folders.personImages);
            } catch (error) {
                console.error('Error uploading avatar to S3:', error);
                throw new HttpException(HttpStatus.BadRequest, 'Failed to upload avatar image');
            }
        } else if (model.avatar_url && !checkValidUrl(model.avatar_url)) {
            throw new HttpException(HttpStatus.BadRequest, `The URL '${model.avatar_url}' is not valid`);
        }

        // Handle address field - convert string to object if needed
        let addressData = model.address || item.address;
        if (typeof addressData === 'string') {
            try {
                addressData = JSON.parse(addressData);
            } catch (error) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid address format');
            }
        }

        const updateData = {
            first_name: model.first_name || item.first_name,
            last_name: model.last_name || item.last_name,
            phone_number: model.phone_number || item.phone_number,
            avatar_url: avatarUrl,
            dob: model.dob || item.dob,
            address: addressData,
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

    /**
     * Get staff and laboratory technician users
     */
    public async getStaffAndLabTechUsers(): Promise<any[]> {
        try {
            // Get users with STAFF or LABORATORY_TECHNICIAN role
            const users = await UserSchema.find({
                role: { $in: [UserRoleEnum.STAFF, UserRoleEnum.LABORATORY_TECHNICIAN] },
                is_deleted: { $ne: true }, // Exclude deleted users
            })
                .select('_id first_name last_name email phone_number role')
                .lean();

            if (!users || users.length === 0) {
                return [];
            }

            // Get staff profiles for these users
            const userIds = users.map((user) => user._id);
            const staffProfiles = await StaffProfileSchema.find({
                user_id: { $in: userIds },
                status: StaffStatusEnum.ACTIVE,
            })
                .lean()
                .select('user_id status department');

            // Combine user and profile information
            const usersWithProfiles = users.map((user) => {
                const profile = staffProfiles.find((p) => p.user_id && user._id && p.user_id.toString() === user._id.toString());

                return {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number,
                    role: user.role,
                    staff_profile: profile
                        ? {
                              status: profile.status,
                              department: profile.department_id,
                          }
                        : null,
                };
            });

            return usersWithProfiles;
        } catch (error) {
            console.error('Error in getStaffAndLabTechUsers:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error getting staff and laboratory technician users');
        }
    }

    /**
     * Search customer by phone number or email (for staff convenience)
     */
    public async searchCustomerByPhoneOrEmail(searchTerm: string): Promise<IUser | null> {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                throw new HttpException(HttpStatus.BadRequest, 'Search term is required');
            }

            const trimmedSearchTerm = searchTerm.trim().toLowerCase();

            // Build search conditions based on input type
            let searchConditions = [];

            // Check if searchTerm looks like an email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(trimmedSearchTerm)) {
                searchConditions.push({ email: { $regex: trimmedSearchTerm, $options: 'i' } });
            }

            // Check if searchTerm looks like a phone number (digits only)
            const phoneRegex = /^\d+$/;
            if (phoneRegex.test(trimmedSearchTerm)) {
                // Convert to number for phone_number field
                const phoneNumber = parseInt(trimmedSearchTerm, 10);
                if (!isNaN(phoneNumber)) {
                    searchConditions.push({ phone_number: phoneNumber });
                }
            }

            // If neither email nor phone pattern, search in both fields
            if (searchConditions.length === 0) {
                // Try as email (partial match)
                searchConditions.push({ email: { $regex: trimmedSearchTerm, $options: 'i' } });

                // Try as phone number (if it's numeric)
                const phoneNumber = parseInt(trimmedSearchTerm, 10);
                if (!isNaN(phoneNumber)) {
                    searchConditions.push({ phone_number: phoneNumber });
                }
            }

            // Search by phone number or email
            const customer = await UserSchema.findOne({
                $or: searchConditions,
                role: UserRoleEnum.CUSTOMER,
                is_deleted: { $ne: true },
            })
                .select('-password -verification_token -verification_token_expires -token_version')
                .lean();

            if (!customer) {
                return null;
            }

            // Get administrative cases for this customer
            const administrative_cases = await AdministrativeCaseSchema.find({
                applicant_id: customer._id,
            })
                .select('case_number case_type status requesting_agency created_at')
                .lean();

            return {
                ...customer,
                administrative_cases,
            };
        } catch (error) {
            console.error('Error in searchCustomerByPhoneOrEmail:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error searching for customer');
        }
    }
}
