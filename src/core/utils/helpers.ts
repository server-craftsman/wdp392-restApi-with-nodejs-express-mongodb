import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../../modules/auth';
import moment from 'moment';
import { DATE_FORMAT } from '../constants';

export const getUserIdCurrent = (authHeader: string) => {
    if (!authHeader) {
        return '';
    }
    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_TOKEN_SECRET ?? '') as DataStoredInToken;
    return user;
};

export const isEmptyObject = (obj: any): boolean => {
    return !Object.keys(obj).length;
};

export const formatResponse = <T>(data: T, success: boolean = true, message?: string) => {
    return {
        success,
        data,
        message
    };
};

export const generateRandomNo = (PREFIX_TITLE: string, numberLimit = 6) => {
    const randomNumbers = Array.from({ length: numberLimit }, () => Math.floor(Math.random() * 10)).join('');
    const yyyymmdd = moment().format(DATE_FORMAT.YYYYMMDD); // Format current date as YYYYMMDD
    return `${PREFIX_TITLE}_${randomNumbers}${yyyymmdd}`;
};
