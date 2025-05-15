import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import 'reflect-metadata'; // for class-transformer
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { IRoute } from './core/interfaces';
import { errorMiddleware } from './core/middleware';
import { logger } from './core/utils';

export default class App {
    public app: express.Application;
    public port: string | number;
    public production: boolean;

    constructor(routes: IRoute[]) {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.production = !!(process.env.NODE_ENV === 'production');

        this.connectToDatabase();
        this.initializeMiddleware();
        this.initializeRoute(routes);
        this.initializeErrorMiddleware();
        this.initializeSwagger();
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`Server is running at port ${this.port}`);
        });
    }

    // connect to mongoDB
    private connectToDatabase() {
        const mongoDbUri = process.env.MONGODB_URI;
        if (!mongoDbUri) {
            logger.error('MongoDb URI is empty!');
            return;
        }
        mongoose.connect(mongoDbUri).catch((error) => {
            logger.error('Connection to database error: ' + error);
        });
        logger.info('Connection to database success!');
    }

    // declare middleware
    private initializeMiddleware() {
        if (this.production) {
            this.app.use(hpp());
            this.app.use(helmet());
            this.app.use(morgan('combined'));
            // this.app.use(cors({ origin: "your.domain.com", credentials: true }));
            this.app.use(cors({ origin: true, credentials: true }));
        } else {
            this.app.use(morgan('dev'));
            this.app.use(cors({ origin: true, credentials: true }));
        }
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    // declare error handler middleware
    private initializeErrorMiddleware() {
        this.app.use(errorMiddleware);
    }

    // declare init router
    private initializeRoute(routes: IRoute[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });

        // config for swagger
        this.app.use('/swagger', express.static(path.join(__dirname, '../node_modules/swagger-ui-dist')));
    }

    // initialize Swagger documentation
    private initializeSwagger() {
        const swaggerPath = path.join(__dirname, '../swagger.yaml');
        const swaggerDocument = YAML.load(swaggerPath);
        swaggerDocument.host = process.env.DOMAIN_API;
        this.app.use(
            '/api-docs',
            swaggerUi.serve,
            swaggerUi.setup(swaggerDocument, {
                swaggerOptions: {
                    url: '/swagger/swagger.yaml',
                },
            }),
        );
    }
}
