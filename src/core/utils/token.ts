import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DataStoredInToken, TokenData } from '../../modules/auth';
import { IUser } from '../../modules/user';

export const createToken = (user: IUser): TokenData => {
    const dataInToken: DataStoredInToken = { id: user.id, role: user.role, version: user.token_version };
    const secret: string = process.env.JWT_TOKEN_SECRET!;
    const expiresIn: number = 28800;
    return {
        token: jwt.sign(dataInToken, secret, { expiresIn }),
    };
};

// create token verification
export const createTokenVerifiedUser = () => {
    return {
        verification_token: crypto.randomBytes(16).toString('hex'),
        verification_token_expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    };
};
