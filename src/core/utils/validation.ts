import { HttpStatus } from '../enums';
import { HttpException } from '../exceptions';

export const checkUserMatch = (userId: string, userInItem: string, title: string) => {
    if (userId !== userInItem) {
        throw new HttpException(HttpStatus.BadRequest, `You cannot update or delete another user's ${title}!`);
    }
};

export const checkValidUrl = (url: string) => {
    const urlPattern = /^(http:\/\/|https:\/\/)/i;
    return urlPattern.test(url);
};
