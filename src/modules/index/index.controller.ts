import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../core/enums";
import { version } from "../../../package.json";
import path from 'path';

export default class IndexController {
    public index = (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentTime = new Date().toISOString();
            const data = {
                message: "Api is running in server...",
                api_version: version || "1.0.0",
                server_time: currentTime,
                author: "Huy Developer 👨‍💻✨",
                links: {
                    documentation: "https://restapi-dna-testing-fwdnadcqc9hsfmbf.canadacentral-01.azurewebsites.net/api-docs/",
                    services: "/api-docs"
                }
            };

            res.render('index', data);
        } catch (error) {
            next(error);
        }
    };
}