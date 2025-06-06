import dotenv from 'dotenv';
import App from './app';
import { validateEnv } from './core/utils';
import { DocsRoute } from './modules/docs';
import { IndexRoute } from './modules/index'
import { UserRoute } from './modules/user';
import { AuthRoute } from './modules/auth';
import { PaymentRoute } from './modules/payment';
import { ServiceRoute } from './modules/service';
import { DepartmentRoute } from './modules/department';
import { StaffProfileRoute } from './modules/staff_profile';
import { SlotRoute } from './modules/slot';
import { AppointmentRoute } from './modules/appointment';
import { AppointmentLogRoute } from './modules/appointment_log';
import { KitRoute } from './modules/kit';
import { SampleRoute } from './modules/sample';
import { ResultRoute } from './modules/result';
import { RegistrationFormRoute } from './modules/registration_form';
import { BlogRoute } from './modules/blog';
import { BlogCategoryRoute } from './modules/blog_category';
import { LogRoute } from './modules/blog/log';

dotenv.config();
validateEnv();

const routes = [
    new IndexRoute(),
    new DocsRoute(),
    new AuthRoute(),
    new UserRoute(),
    new PaymentRoute(),
    new ServiceRoute(),
    new DepartmentRoute(),
    new StaffProfileRoute(),
    new SlotRoute(),
    new AppointmentRoute(),
    new AppointmentLogRoute(),
    new KitRoute(),
    new SampleRoute(),
    new ResultRoute(),
    new RegistrationFormRoute(),
    new BlogRoute(),
    new BlogCategoryRoute(),
    new LogRoute()
];

const app = new App(routes);

app.listen();
