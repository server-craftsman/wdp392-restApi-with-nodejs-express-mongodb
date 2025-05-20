import dotenv from 'dotenv';
import App from './app';
import { validateEnv } from './core/utils';
import { IndexRoute } from './modules/index'
import { UserRoute } from './modules/user';
import { AuthRoute } from './modules/auth';
import { PaymentRoute } from './modules/payment';

dotenv.config();

validateEnv();

const routes = [
    new IndexRoute(),
    new AuthRoute(),
    new UserRoute(),
    new PaymentRoute(),
];

const app = new App(routes);

app.listen();
