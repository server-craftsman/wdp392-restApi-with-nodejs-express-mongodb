import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../core/enums";
import { formatResponse } from "../../core/utils";
import { version } from "../../../package.json";
import path from 'path';
import fs from 'fs';

export default class IndexController {
    /**
     * API root endpoint
     * Returns information about the API in various formats based on Accept header
     */
    public index = (req: Request, res: Response, next: NextFunction) => {
        try {
            const apiInfo = {
                name: "Bloodline DNA Testing Service API",
                version: version,
                status: "running",
                documentation: "/api-docs",
                timestamp: new Date().toISOString()
            };

            // Get the Accept header
            const acceptHeader = req.header('Accept');

            // Respond based on the requested format
            if (acceptHeader && acceptHeader.includes('text/html')) {
                // HTML response
                const htmlResponse = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${apiInfo.name}</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        header {
                            border-bottom: 1px solid #eee;
                            padding-bottom: 20px;
                            margin-bottom: 20px;
                        }
                        h1 {
                            color: #2c3e50;
                        }
                        .status {
                            display: inline-block;
                            background-color: #27ae60;
                            color: white;
                            padding: 5px 10px;
                            border-radius: 4px;
                            font-weight: bold;
                        }
                        .api-details {
                            background-color: #f9f9f9;
                            border-left: 4px solid #2c3e50;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .api-details p {
                            margin: 10px 0;
                        }
                        .docs-button {
                            display: inline-block;
                            background-color: #3498db;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: bold;
                            margin-top: 20px;
                        }
                        .docs-button:hover {
                            background-color: #2980b9;
                        }
                        footer {
                            margin-top: 40px;
                            text-align: center;
                            color: #7f8c8d;
                            font-size: 0.9em;
                        }
                    </style>
                </head>
                <body>
                    <header>
                        <h1>${apiInfo.name}</h1>
                        <div class="status">Status: ${apiInfo.status}</div>
                    </header>
                    
                    <main>
                        <div class="api-details">
                            <p><strong>Version:</strong> ${apiInfo.version}</p>
                            <p><strong>Last Updated:</strong> ${apiInfo.timestamp}</p>
                        </div>
                                                
                        <a href="${apiInfo.documentation}" class="docs-button">View API Documentation</a>
                    </main>
                    
                    <footer>
                        &copy; ${new Date().getFullYear()} Bloodline DNA Testing Service
                    </footer>
                </body>
                </html>
                `;
                res.header('Content-Type', 'text/html').send(htmlResponse);
            } else if (acceptHeader && acceptHeader.includes('application/xml')) {
                // XML response
                const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                <api>
                    <name>${apiInfo.name}</name>
                    <version>${apiInfo.version}</version>
                    <status>${apiInfo.status}</status>
                    <documentation>${apiInfo.documentation}</documentation>
                    <timestamp>${apiInfo.timestamp}</timestamp>
                </api>`;
                res.header('Content-Type', 'application/xml').send(xmlResponse);
            } else {
                // Default JSON response
                res.status(HttpStatus.Success).json(formatResponse(apiInfo));
            }
        } catch (error) {
            next(error);
        }
    };

    /**
     * Serve a welcome page
     * Returns a static HTML welcome page
     */
    public welcomePage = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.sendFile(path.join(__dirname, '../../../public/welcome.html'));
        } catch (error) {
            next(error);
        }
    };

    /**
     * API documentation redirect
     * Redirects to the Swagger documentation
     */
    public apiDocs = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.redirect('/api-docs');
        } catch (error) {
            next(error);
        }
    };
}