
import { plainToInstance } from "class-transformer";
import { ValidationError, validate } from "class-validator";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { HttpStatus } from "../enums";
import { HttpException } from "../exceptions";
import { IError } from "../interfaces";

const validationMiddleware = (type: any, skipMissingProperties = false): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        validate(plainToInstance(type, req.body), { skipMissingProperties: skipMissingProperties }).then(
            (errors: ValidationError[]) => {
                if (errors.length > 0) {
                    let errorResults: IError[] = [];

                    const extractConstraints = (error: ValidationError) => {
                        if (error.constraints) {
                            Object.values(error.constraints || {}).forEach((message) => {
                                errorResults.push({
                                    message,
                                    field: error.property,
                                });
                            });
                        }
                        if (error.children && error.children.length > 0) {
                            error.children.forEach((childError) => {
                                extractConstraints(childError);
                            });
                        }
                    };

                    errors.forEach((error) => {
                        extractConstraints(error);
                    });

                    next(new HttpException(HttpStatus.BadRequest, "", errorResults));
                } else {
                    next();
                }
            }
        );
    };
};

export default validationMiddleware;
