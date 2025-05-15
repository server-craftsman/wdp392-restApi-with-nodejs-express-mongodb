import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import moment from 'moment';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { createToken, createTokenVerifiedUser, encodePasswordUserNormal, isEmptyObject } from '../../core/utils';
import { sendMail } from '../../core/utils/sendMail';
import { IUser, UserSchema } from '../user';
import { TokenData } from './auth.interface';
import LoginDto from './dtos/login.dto';
import LoginGoogleDto from './dtos/loginGoogle.dto';

export default class AuthService {
    public userSchema = UserSchema;

    public async login(model: LoginDto | LoginGoogleDto, isGoogle = false): Promise<TokenData> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model user is empty');
        }

        let emailCheck = model.email;
        let userLogin = model;

        // login by google
        if (isGoogle) {
            if (model.google_id) {
                try {
                    const client = new OAuth2Client();
                    // check google_id is valid
                    const ticket = await client.verifyIdToken({
                        idToken: model.google_id,
                    });
                    console.log(ticket);
                    // get user info from ticket
                    const payload = ticket.getPayload();
                    // If payload already exists, assign email and emailCheck
                    if (payload) {
                        userLogin.email = payload.email!;
                        emailCheck = payload.email!;
                    }
                } catch (error) {
                    throw new HttpException(HttpStatus.BadRequest, 'Account google is incorrect, please try again!');
                }
            } else {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Field google_id via IdToken is empty, please send google_id!',
                );
            }
        }

        const user = await this.userSchema.findOne({ email: emailCheck }).exec();
        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, `Your email: ${emailCheck} is not exists.`);
        }

        if (!user.is_verified) {
            throw new HttpException(HttpStatus.BadRequest, 'User is not verified! Please check your email in 24h!');
        }

        if (user.google_id && model.password) {
            throw new HttpException(HttpStatus.BadRequest, 'You must login by google!');
        }

        // login normal
        if (!isGoogle && model.password) {
            const isMatchPassword = await bcryptjs.compare(model.password, user.password!);
            if (!isMatchPassword) {
                throw new HttpException(HttpStatus.BadRequest, `Your password is incorrect!`);
            }
        }

        if (!user.status) {
            throw new HttpException(
                HttpStatus.Forbidden,
                `Your account has been locked. Please contact admin via mail to activate!`,
            );
        }

        if (user.is_deleted) {
            throw new HttpException(
                HttpStatus.Forbidden,
                `Your account has been deleted. Please contact admin via mail to help!`,
            );
        }

        if (!user.token_version) {
            user.token_version = 0;
        }

        return createToken(user);
    }

    public async verifiedTokenUser(verifiedToken: string): Promise<boolean> {
        const user = await this.userSchema.findOne({
            verification_token: verifiedToken,
        });

        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, `Token is not valid.`);
        }
        // use moment to parse verification_token_expires with format 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ'
        const tokenExpires = moment(
            user?.verification_token_expires?.toString(),
            'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ',
        ).toDate();
        // if current time is after token expires => throw error
        if (moment(new Date()).isAfter(moment(tokenExpires))) {
            throw new HttpException(HttpStatus.BadRequest, `Token is expired!`);
        }

        user.is_verified = true;
        user.verification_token = undefined;
        user.verification_token_expires = undefined;
        user.updated_at = new Date();

        const updateUserId = await user.save();
        if (!updateUserId) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot update user!');
        }

        return true;
    }

    public async resendTokenUser(email: string): Promise<boolean> {
        const user = await this.userSchema.findOne({ email }).exec();
        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, `User with mail: ${email} is not exists.`);
        }

        if (user.is_verified) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `User with mail: ${email} has already verified their email.`,
            );
        }

        // create token verification
        const tokenData = createTokenVerifiedUser();
        user.is_verified = false;
        user.verification_token = tokenData.verification_token;
        user.verification_token_expires = tokenData.verification_token_expires;
        user.updated_at = new Date();
        const domain = process.env.DOMAIN_FE;

        // send mail with token
        const sendMailResult = await sendMail({
            toMail: user.email,
            subject: 'Verify your email address',
            content: `Hello, ${user.first_name} ${user.last_name}.\nPlease click the following link to verify your email address:\n${domain}/verify-email/${tokenData.verification_token}`,
        });
        if (!sendMailResult) {
            throw new HttpException(HttpStatus.BadRequest, `Cannot send mail for ${user.email}`);
        }

        const updateUser = await user.save();
        if (!updateUser) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot update user!');
        }

        return true;
    }

    public async getCurrentLoginUser(userId: string): Promise<IUser> {
        const user = await this.userSchema.findById(userId).lean(); // lean() => just only read data, do not another action like update, delete, etc.
        // help reduce overhead memory
        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, `User is not exists.`);
        }
        delete user.password;
        return user;
    }

    public async forgotPassword(email: string): Promise<boolean> {
        const user = await this.userSchema.findOne({ email, is_deleted: false, is_verified: true });
        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, `User with mail: ${email} is not exists.`);
        }

        if (user.google_id) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `Your account is logged in by google. Please contact google for reset password!`,
            );
        }

        // handle encode password
        const generateRandomPassword = this.generateRandomPassword(10);

        // send mail with new password
        const sendMailResult = await sendMail({
            toMail: user.email,
            subject: 'Generate new password for user',
            html: `Hello, ${user.first_name} ${user.last_name}.<br>This is a new password for ${user.email} is:<br><strong>${generateRandomPassword}</strong>`,
        });
        if (!sendMailResult) {
            throw new HttpException(HttpStatus.BadRequest, `Cannot send mail for ${user.email}`);
        }

        const newPassword = await encodePasswordUserNormal(generateRandomPassword);
        user.password = newPassword;
        user.updated_at = new Date();
        const updateUser = await user.save();
        if (!updateUser) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot update user!');
        }

        return true;
    }

    public async logout(userId: string): Promise<boolean> {
        const user = await this.userSchema.findByIdAndUpdate(userId, { $inc: { token_version: 1 } });
        if (!user) {
            throw new HttpException(HttpStatus.BadRequest, `Cannot logout!`);
        }
        return true;
    }

    private generateRandomPassword(length: number) {
        return crypto
            .randomBytes(length) // generate random bytes
            .toString('base64') // convert to base64
            .slice(0, length) // slice the length of the string, 0 is the start index, length is the end index
            .replace(/[^a-zA-Z0-9]/g, ''); // replace all non-alphanumeric characters with an empty string
    }
}
