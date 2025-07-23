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
                        url: "http://localhost:6969/",
                        description: "Local server"
                    },
                    {
                        url: "https://restapi-dnatesting.up.railway.app/",
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

        // Add endpoint count to swagger UI
        this.router.use(this.path, (req, res, next) => {
            // Add endpoint count to res.locals for access in the view
            res.locals.endpointCount = endpointCount;

            // Dynamically detect current server URL with proper protocol handling
            const forwardedProto = req.get('x-forwarded-proto');
            const cloudflareProto = req.get('cf-visitor') ? JSON.parse(req.get('cf-visitor') || '{}').scheme : null;
            const host = req.get('host') || req.get('x-forwarded-host');

            // Determine the correct protocol
            let protocol = 'http';
            if (forwardedProto) {
                protocol = forwardedProto;
            } else if (cloudflareProto) {
                protocol = cloudflareProto;
            } else if (req.secure || req.protocol === 'https') {
                protocol = 'https';
            } else if (host && (host.includes('vercel.app') || host.includes('railway.app') || host.includes('onrender.com') || host.includes('herokuapp.com'))) {
                // Force HTTPS for known production domains
                protocol = 'https';
            } else {
                protocol = req.protocol;
            }

            const currentServerUrl = `${protocol}://${host}/`;

            // Get current environment
            const nodeEnv = process.env.NODE_ENV || 'development';

            // Build servers array based on environment
            let servers = [
                {
                    url: currentServerUrl,
                    description: `Current server (${nodeEnv} - auto-detected)`
                }
            ];

            // Add environment-specific servers
            if (nodeEnv === 'development') {
                servers.push(
                    {
                        url: "http://localhost:6969/",
                        description: "Local development server (port 6969)"
                    },
                    {
                        url: "http://localhost:8080/",
                        description: "Local development server (port 8080)"
                    },
                    {
                        url: "http://localhost:3000/",
                        description: "Local development server (port 3000)"
                    }
                );
            } else if (nodeEnv === 'production') {
                servers.push(
                    {
                        url: "https://restapi-dnatesting.up.railway.app/",
                        description: "Production server (Railway)"
                    },
                    {
                        url: "https://restapi-dna-testing.onrender.com/",
                        description: "Production server (Render)"
                    }
                );
            } else {
                // For staging, testing, or other environments
                servers.push(
                    {
                        url: "http://localhost:6969/",
                        description: "Local development server"
                    },
                    {
                        url: "https://restapi-dna-testing.onrender.com/",
                        description: "Production server"
                    }
                );
            }

            // Create dynamic swagger spec with current server as default
            const dynamicSwaggerSpec = swaggerJsdoc({
                ...options,
                definition: {
                    ...options.definition,
                    servers: servers
                }
            });

            // Store the dynamic spec for this request
            (req as any).swaggerSpec = dynamicSwaggerSpec;
            next();
        });

        // Serve swagger UI
        this.router.use(this.path, swaggerUi.serve);
        this.router.get(this.path, (req, res, next) => {
            // Use the dynamically generated swagger spec
            const swaggerSpec = (req as any).swaggerSpec;

            swaggerUi.setup(swaggerSpec, {
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
            })(req, res, next);
        });

        // Serve swagger spec as JSON with dynamic server detection
        this.router.get(`${this.path}.json`, (req, res) => {
            // Dynamically detect current server URL with proper protocol handling
            const forwardedProto = req.get('x-forwarded-proto');
            const cloudflareProto = req.get('cf-visitor') ? JSON.parse(req.get('cf-visitor') || '{}').scheme : null;
            const host = req.get('host') || req.get('x-forwarded-host');

            // Determine the correct protocol
            let protocol = 'http';
            if (forwardedProto) {
                protocol = forwardedProto;
            } else if (cloudflareProto) {
                protocol = cloudflareProto;
            } else if (req.secure || req.protocol === 'https') {
                protocol = 'https';
            } else if (host && (host.includes('vercel.app') || host.includes('railway.app') || host.includes('onrender.com') || host.includes('herokuapp.com'))) {
                // Force HTTPS for known production domains
                protocol = 'https';
            } else {
                protocol = req.protocol;
            }

            const currentServerUrl = `${protocol}://${host}/`;

            // Get current environment
            const nodeEnv = process.env.NODE_ENV || 'development';

            // Build servers array based on environment
            let servers = [
                {
                    url: currentServerUrl,
                    description: `Current server (${nodeEnv} - auto-detected)`
                }
            ];

            // Add environment-specific servers
            if (nodeEnv === 'development') {
                servers.push(
                    {
                        url: "http://localhost:6969/",
                        description: "Local development server (port 6969)"
                    },
                    {
                        url: "http://localhost:8080/",
                        description: "Local development server (port 8080)"
                    },
                    {
                        url: "http://localhost:3000/",
                        description: "Local development server (port 3000)"
                    }
                );
            } else if (nodeEnv === 'production') {
                servers.push(
                    {
                        url: "https://restapi-dnatesting.up.railway.app/",
                        description: "Production server (Railway)"
                    },
                    {
                        url: "https://restapi-dna-testing.onrender.com/",
                        description: "Production server (Render)"
                    }
                );
            } else {
                // For staging, testing, or other environments
                servers.push(
                    {
                        url: "http://localhost:6969/",
                        description: "Local development server"
                    },
                    {
                        url: "https://restapi-dna-testing.onrender.com/",
                        description: "Production server"
                    }
                );
            }

            // Create dynamic swagger spec with current server as default
            const dynamicSwaggerSpec = swaggerJsdoc({
                ...options,
                definition: {
                    ...options.definition,
                    servers: servers
                }
            });

            res.json(dynamicSwaggerSpec);
        });
    }
} 