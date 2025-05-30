import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import compression from 'compression';
import 'reflect-metadata'; // for class-transformer
import { IRoute } from './core/interfaces';
import { errorMiddleware } from './core/middleware';
import { logger } from './core/utils';

export default class App {
    public app: express.Application;
    public port: string | number;
    public production: boolean;

    constructor(routes: IRoute[]) {
        this.app = express();
        this.port = process.env.WEBSITES_PORT || 3000;
        this.production = !!(process.env.NODE_ENV === 'production');

        this.connectToDatabase();
        this.initializeMiddleware();
        this.initializeRoute(routes);
        this.initializeErrorMiddleware();
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
        this.app.use(compression());

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

        // config ejs - simplified for faster startup
        this.app.set('view engine', 'ejs');

        // Make sure the view path is correctly set for both local and Azure environments
        this.app.set('views', [
            path.join(__dirname, 'modules/index/view'),
            path.join(__dirname, 'modules/index'),
            path.join(__dirname, 'modules')
        ]);

        // Serve static files efficiently
        const staticOptions = {
            maxAge: '1d',
            etag: true
        };

        // config for swagger
        this.app.use('/swagger', express.static(path.join(__dirname, '../node_modules/swagger-ui-dist'), staticOptions));
        // config for images
        this.app.use('/images', express.static(path.join(__dirname, '../public/images'), staticOptions));
    }
}
