import dotenv from 'dotenv';
import App from './app';
import { validateEnv } from './core/utils';
import { IndexRoute } from './modules/index'
import { UserRoute } from './modules/user';
import { AuthRoute } from './modules/auth';
import { PaymentRoute } from './modules/payment';
import { ServiceRoute } from './modules/service';

dotenv.config();

validateEnv();

const routes = [
    new IndexRoute(),
    new AuthRoute(),
    new UserRoute(),
    new PaymentRoute(),
    new ServiceRoute(),
];

const app = new App(routes);

app.listen();
