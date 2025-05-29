import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../core/enums";
import { version } from "../../../package.json";
import path from 'path';

export default class IndexController {
    public index = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(HttpStatus.Success).json({
                message: "Bloodline DNA Testing Service API is running",
                version: version,
                documentation: "/docs"
            });
        } catch (error) {
            next(error);
        }
    };

    public apiDocs = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.redirect('/docs');
        } catch (error) {
            next(error);
        }
    };
}