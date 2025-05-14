import { Router } from 'express';
import { IRoute } from '../../core/interfaces';
import IndexController from './index.controller';

export default class IndexRoute implements IRoute {
    public path = '/';
    public router = Router();

    public indexController = new IndexController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.indexController.index);
    }
}
