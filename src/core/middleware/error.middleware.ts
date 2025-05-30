import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../enums";
import { HttpException } from "../exceptions";
import { logger } from "../utils";

const errorMiddleware = (error: Error | HttpException, req: Request, res: Response, next: NextFunction) => {
    let status: number = HttpStatus.InternalServerError;
    let message: string = "Something went wrong!";
    let errors: any[] = [];

    if (error instanceof HttpException) {
        status = error.status;
        message = error.message || "Something went wrong!";
        errors = error.errors || [];
    } else {
        logger.error(`Unhandled error: ${error.message}`, error);
        message = error.message || "Internal server error";
    }

    logger.error(`[ERROR] - Status: ${status} - Msg: ${message}`);

    res.status(status).json({
        success: false,
        message,
        errors: errors.length ? errors : undefined,
    });
};

export default errorMiddleware;
