import { formatResponse, generateRandomNo, getUserIdCurrent, isEmptyObject } from './helpers';
import logger from './logger';
import { encodePasswordUserNormal } from './password';
import { itemsQuery } from './query';
import { formatPaginationResult } from './service';
import { sendMail, createVerificationEmailTemplate, createPasswordResetEmailTemplate, createNotificationEmailTemplate } from './sendMail';
import { createToken, createTokenVerifiedUser } from './token';
import validateEnv from './validateEnv';
import { checkUserMatch, checkValidUrl } from './validation';
import { uploadFileToS3, uploadMultipleFilesToS3 } from './s3Upload';
import { s3Client, bucketName, s3Folders } from './aws.config';

export {
    checkUserMatch,
    checkValidUrl,
    createToken,
    createTokenVerifiedUser,
    createVerificationEmailTemplate,
    createPasswordResetEmailTemplate,
    createNotificationEmailTemplate,
    encodePasswordUserNormal,
    formatPaginationResult,
    formatResponse,
    generateRandomNo,
    getUserIdCurrent,
    isEmptyObject,
    itemsQuery,
    logger,
    sendMail,
    validateEnv,
    uploadFileToS3,
    uploadMultipleFilesToS3,
    s3Client,
    bucketName,
    s3Folders,
};
