import { IUser, UserSchema } from '../user';

export default class AuthRepository {
    public async findUserByEmail(email: string): Promise<IUser | null> {
        return UserSchema.findOne({ email }).exec();
    }

    public async findUserById(userId: string): Promise<IUser | null> {
        return UserSchema.findById(userId).lean();
    }

    public async findUserByVerificationToken(token: string): Promise<IUser | null> {
        return UserSchema.findOne({ verification_token: token });
    }

    public async updateUser(user: IUser): Promise<IUser> {
        return user.save();
    }

    public async updateUserById(userId: string, update: Partial<IUser>): Promise<IUser | null> {
        return UserSchema.findByIdAndUpdate(userId, update, { new: true });
    }
}
