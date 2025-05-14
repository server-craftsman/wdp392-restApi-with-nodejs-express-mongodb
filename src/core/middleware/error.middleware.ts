
import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../enums";
import { HttpException } from "../exceptions";
import { logger } from "../utils";

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    const status: number = error.status || HttpStatus.InternalServerError;
    const messageErrors = error.errors?.length ? null : "Something went wrong!";
    const message = error.message ? error.message : messageErrors;

    logger.error(`[ERROR] - Status: ${status} - Msg: ${message}`);
    res.status(status).json({
        success: false,
        message,
        errors: error.errors,
    });
};

export default errorMiddleware;
