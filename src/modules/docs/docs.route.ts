import { Router } from 'express';
import { IRoute } from '../../core/interfaces';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';

export default class DocsRoute implements IRoute {
    public path = '/api-docs';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    /**
     * Count the number of endpoints in the project by analyzing route files
     * @returns The total number of endpoints
     */
    private countEndpoints(): number {
        let totalEndpoints = 0;
        const moduleDir = path.join(__dirname, '..');

        try {
            // Get all module directories
            const modules = fs.readdirSync(moduleDir).filter(file =>
                fs.statSync(path.join(moduleDir, file)).isDirectory()
            );

            // For each module, check if it has a route file
            modules.forEach(moduleName => {
                const routeFilePath = path.join(moduleDir, moduleName, `${moduleName}.route.ts`);

                if (fs.existsSync(routeFilePath)) {
                    // Read the route file content
                    const routeContent = fs.readFileSync(routeFilePath, 'utf8');

                    // Count occurrences of router.get, router.post, router.put, router.delete, etc.
                    const getEndpoints = (routeContent.match(/router\.get\(/g) || []).length;
                    const postEndpoints = (routeContent.match(/router\.post\(/g) || []).length;
                    const putEndpoints = (routeContent.match(/router\.put\(/g) || []).length;
                    const deleteEndpoints = (routeContent.match(/router\.delete\(/g) || []).length;
                    const patchEndpoints = (routeContent.match(/router\.patch\(/g) || []).length;

                    const moduleEndpoints = getEndpoints + postEndpoints + putEndpoints + deleteEndpoints + patchEndpoints;
                    totalEndpoints += moduleEndpoints;
                }
            });

            console.log(`Total endpoints: ${totalEndpoints}`);
            return totalEndpoints;
        } catch (error) {
            console.error('Error counting endpoints:', error);
            return 0;
        }
    }

    private initializeRoutes() {
        // Count endpoints
        const endpointCount = this.countEndpoints();

        // Swagger options
        const options = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Bloodline DNA Testing Service API',
                    description: `API endpoints for a Bloodline DNA Testing Service documented on swagger. This API has ${endpointCount} endpoints in total.`,
                    contact: {
                        name: "Nguyễn Đan Huy",
                        email: "huyit2003@gmail.com",
                        url: "https://github.com/server-craftsman/wdp392-restApi-with-nodejs-express-mongodb"
                    },
                    version: '1.0.0',
                },
                servers: [
                    {
                        url: "https://restapi-dnatesting.up.railway.app/",
                        description: "Live server"
                    },
                    {
                        url: "http://localhost:6969/",
                        description: "Local server"
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

        // Add endpoint count to swagger UI
        this.router.use(this.path, (req, res, next) => {
            // Add endpoint count to res.locals for access in the view
            res.locals.endpointCount = endpointCount;
            next();
        });

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
                .swagger-ui .topbar { background-color: rgb(0, 0, 0); }
                .swagger-ui .opblock-tag { font-size: 16px; margin: 10px 0 5px 0; }
                .swagger-ui .opblock .opblock-summary-description { font-size: 13px; }
                .swagger-ui .opblock-tag:hover { background-color: rgba(0, 0, 0, 0.1); }
                .endpoint-count { 
                    background-color: #49cc90; 
                    color: white; 
                    padding: 5px 10px; 
                    border-radius: 4px; 
                    margin: 10px 0; 
                    display: inline-block; 
                    font-weight: bold;
                }
            `,
            customSiteTitle: `API Documentation (${endpointCount} endpoints)`,
            customfavIcon: "/favicon.ico"
        }));

        // Serve swagger spec as JSON
        this.router.get(`${this.path}.json`, (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });
    }
} 