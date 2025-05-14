import { UserRole } from '../user';

export interface DataStoredInToken {
    id: string;
    role: UserRole | string;
    version: number;
}

export interface TokenData {
    token: string;
}

export const UserInfoInTokenDefault = {
    id: '',
    role: '',
    version: 0
};
