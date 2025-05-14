import dotenv from 'dotenv';
import App from './app';
import { validateEnv } from './core/utils';
import { IndexRoute } from './modules/index'
import { UserRoute } from './modules/user';
import { AuthRoute } from './modules/auth';

dotenv.config();

validateEnv();

const routes = [
    new IndexRoute(),
    new AuthRoute(),
    new UserRoute(),
];

const app = new App(routes);

app.listen();
