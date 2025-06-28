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
import { BlogRoute } from './modules/blog';
import { BlogCategoryRoute } from './modules/blog_category';
import { LogRoute } from './modules/blog/log';
import { ReviewRoute } from './modules/review';
import { AdministrativeCasesRoute } from './modules/administrative_cases';
import { DashboardRoute } from './modules/dashboard';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

// Initialize all routes
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
    new BlogRoute(),
    new BlogCategoryRoute(),
    new LogRoute(),
    new ReviewRoute(),
    new AdministrativeCasesRoute(),
    new DashboardRoute()
];

// Create app instance
const app = new App(routes);

// For Vercel serverless deployment, export the Express app
// The app.listen() is handled by your App class internally for Vercel detection
if (process.env.VERCEL) {
    // Export for Vercel serverless functions
    module.exports = app.app;
} else {
    // For local development, start the server
    app.listen();
}

// Default export for ES modules compatibility
export default app.app;
