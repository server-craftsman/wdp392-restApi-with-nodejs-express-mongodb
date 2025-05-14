
import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../core/enums";

export default class IndexController {
    public index = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(HttpStatus.Success).json("Api is running in server...");
        } catch (error) {
            next(error);
        }
    };
}
