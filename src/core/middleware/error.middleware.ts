import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../enums';
import { HttpException } from '../exceptions';
import { logger } from '../utils';
import mongoose from 'mongoose';

const errorMiddleware = (error: Error | HttpException, req: Request, res: Response, next: NextFunction) => {
    let status: number = HttpStatus.InternalServerError;
    let message: string = 'Something went wrong!';
    let errors: any[] = [];
    let stack: string | undefined = process.env.NODE_ENV === 'production' ? undefined : error.stack;

    if (error instanceof HttpException) {
        status = error.status;
        message = error.message || 'Something went wrong!';
        errors = error.errors || [];
    } else if (error instanceof mongoose.Error.ValidationError) {
        status = HttpStatus.BadRequest;
        message = 'Validation error';
        errors = Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
        }));
    } else if (error instanceof mongoose.Error.CastError) {
        status = HttpStatus.BadRequest;
        message = `Invalid ${error.path}: ${error.value}`;
    } else if (error.name === 'SyntaxError') {
        status = HttpStatus.BadRequest;
        message = 'Invalid JSON syntax';
    } else {
        logger.error(`Unhandled error: ${error.message}`, error);
        message = error.message || 'Internal server error';
    }

    // Log the error with more context
    logger.error(`[ERROR] - Status: ${status} - Msg: ${message}`);
    if (errors.length) {
        logger.error(`Error details: ${JSON.stringify(errors)}`);
    }

    // Include the request path and method in the log
    logger.error(`Request: ${req.method} ${req.path}`);

    res.status(status).json({
        success: false,
        message,
        errors: errors.length ? errors : undefined,
        stack: stack,
    });
};

export default errorMiddleware;
