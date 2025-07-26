import UserSchema from './user.model';
import { IUser } from './user.interface';
// import { SearchPaginationUserDto } from './dtos/searchPaginationUser.dto';

export default class UserRepository {
    public async findUserByEmail(email: string): Promise<IUser | null> {
        return UserSchema.findOne({
            email: { $regex: new RegExp('^' + email + '$', 'i') },
            is_deleted: false,
        });
    }

    public async createUser(user: Partial<IUser>): Promise<IUser> {
        return UserSchema.create(user);
    }

    public async findUserById(userId: string): Promise<IUser | null> {
        return UserSchema.findOne({ _id: userId, is_deleted: false, is_verified: true }).lean();
    }

    public async updateUser(userId: string, updateData: Partial<IUser>): Promise<boolean> {
        const result = await UserSchema.updateOne({ _id: userId }, updateData);
        return result.acknowledged;
    }

    public async deleteUser(userId: string): Promise<boolean> {
        const result = await UserSchema.updateOne({ _id: userId }, { is_deleted: true, updated_at: new Date() });
        return result.acknowledged;
    }

    public async getUsers(query: any, pageNum: number, pageSize: number): Promise<IUser[]> {
        return UserSchema.find(query)
            .sort({ updated_at: -1 })
            .select('-password')
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
            .exec();
    }

    public async countUsers(query: any): Promise<number> {
        return UserSchema.find(query).countDocuments().exec();
    }

    public async updatePassword(userId: string, newPassword: string): Promise<boolean> {
        const result = await UserSchema.updateOne({ _id: userId }, { password: newPassword, updated_at: new Date() });
        return result.acknowledged;
    }

    public async updateStatus(userId: string, status: boolean): Promise<boolean> {
        const result = await UserSchema.updateOne({ _id: userId }, { status: status, updated_at: new Date() });
        return result.acknowledged;
    }

    public async updateRole(userId: string, role: string): Promise<boolean> {
        const result = await UserSchema.updateOne({ _id: userId }, { role, updated_at: new Date() });
        return result.acknowledged;
    }

    public async findUserByIdWithStaffProfile(userId: string): Promise<IUser | null> {
        return UserSchema.findOne({ _id: userId, is_deleted: false })
            .populate({
                path: 'staff_profile',
                select: '-__v',
                populate: {
                    path: 'department_id',
                    select: 'name',
                },
            })
            .lean();
    }

    public async getUsersWithStaffProfile(query: any, pageNum: number, pageSize: number): Promise<IUser[]> {
        return UserSchema.find(query)
            .sort({ updated_at: -1 })
            .select('-password')
            .populate({
                path: 'staff_profile',
                select: '-__v',
                populate: {
                    path: 'department_id',
                    select: 'name',
                },
            })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
            .lean();
    }
}
