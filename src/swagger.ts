import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bloodline DNA Testing Service API',
            description: 'API endpoints for a Bloodline DNA Testing Service documented on swagger',
            contact: {
                name: 'Nguyễn Đan Huy',
                email: 'huyit2003@gmail.com',
                url: 'https://github.com/server-craftsman/wdp392-restApi-with-nodejs-express-mongodb',
            },
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:8080/',
                description: 'Local server',
            },
            {
                url: 'https://restapi-dna-testing-fwdnadcqc9hsfmbf.canadacentral-01.azurewebsites.net/',
                description: 'Live server',
            },
        ],
        components: {
            securitySchemes: {
                Bearer: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description: 'Bearer token for authorization',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                Bearer: [],
            },
        ],
    },
    // Paths to files containing OpenAPI definitions
    apis: [
        './src/modules/*/swagger/*.js', // Quét tất cả các file swagger trong các module
        './src/modules/*/dtos/*.ts', // Quét các DTO để lấy thông tin schema (nếu cần)
    ],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: any, port: any) {
    // Swagger Page
    app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                docExpansion: 'none',
                filter: true,
                showExtensions: true,
                tryItOutEnabled: true,
                tagsSorter: 'alpha',
            },
            customCss: '.swagger-ui .topbar { background-color: #2C3E50; }',
        }),
    );

    // Documentation in JSON format
    app.get('/docs.json', (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

export default swaggerDocs;
