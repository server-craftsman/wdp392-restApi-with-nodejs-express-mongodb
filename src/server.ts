import dotenv from 'dotenv';
import App from './app';
import { validateEnv } from './core/utils';
import { IndexRoute } from './modules/index'
import { UserRoute } from './modules/user';
import { AuthRoute } from './modules/auth';
import { PaymentRoute } from './modules/payment';
import { ServiceRoute } from './modules/service';
import { DepartmentRoute } from './modules/department';
import { StaffProfileRoute } from './modules/staff_profile';
import { SlotRoute } from './modules/slot';

dotenv.config();

validateEnv();

const routes = [
    new IndexRoute(),
    new AuthRoute(),
    new UserRoute(),
    new PaymentRoute(),
    new ServiceRoute(),
    new DepartmentRoute(),
    new StaffProfileRoute(),
    new SlotRoute(),
];

const app = new App(routes);

app.listen();
