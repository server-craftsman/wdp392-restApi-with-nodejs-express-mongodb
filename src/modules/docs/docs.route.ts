import { Router } from 'express';
import { IRoute } from '../../core/interfaces';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

export default class DocsRoute implements IRoute {
    public path = '/api-docs';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Swagger options
        const options = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Bloodline DNA Testing Service API',
                    description: "API endpoints for a Bloodline DNA Testing Service documented on swagger",
                    contact: {
                        name: "Nguyễn Đan Huy",
                        email: "huyit2003@gmail.com",
                        url: "https://github.com/server-craftsman/wdp392-restApi-with-nodejs-express-mongodb"
                    },
                    version: '1.0.0',
                },
                servers: [
                    {
                        url: "http://localhost:8080/",
                        description: "Local server"
                    },
                    {
                        url: "https://restapi-dna-testing-fwdnadcqc9hsfmbf.canadacentral-01.azurewebsites.net/",
                        description: "Live server"
                    },
                ],
                components: {
                    securitySchemes: {
                        Bearer: {
                            type: "apiKey",
                            name: "Authorization",
                            in: "header",
                            description: "Bearer token for authorization",
                            scheme: "bearer",
                            bearerFormat: "JWT"
                        }
                    }
                }
            },
            apis: [
                './src/modules/*/swagger/*.js',
                './src/modules/*/dtos/*.ts'
            ],
        };

        const swaggerSpec = swaggerJsdoc(options);

        // Serve swagger UI
        this.router.use(this.path, swaggerUi.serve);
        this.router.get(this.path, swaggerUi.setup(swaggerSpec, {
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                docExpansion: 'list',
                filter: true,
                showExtensions: true,
                tryItOutEnabled: true,
                tagsSorter: 'alpha',
                defaultModelsExpandDepth: 1,
                operationsSorter: 'alpha'
            },
            customCss: `
                .swagger-ui .topbar { background-color: rgb(0, 43, 2); }
                .swagger-ui .opblock-tag { font-size: 16px; margin: 10px 0 5px 0; }
                .swagger-ui .opblock .opblock-summary-description { font-size: 13px; }
                .swagger-ui .opblock-tag:hover { background-color: rgba(0, 43, 2, 0.1); }
            `
        }));

        // Serve swagger spec as JSON
        this.router.get(`${this.path}.json`, (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
    }
} 