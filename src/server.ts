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
import ChatRoute from './modules/chat/chat.route';
import { createServer } from 'http';
// @ts-ignore – socket.io types may be absent in serverless bundle but are present in dev
import type { Server as IOServer } from 'socket.io';
import registerChatSocket from './modules/chat/chat.socket';

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
    new DashboardRoute(),
    new ChatRoute()
];

// Create app instance
const appInstance = new App(routes);

// Create HTTP server (needed for Socket.IO)
const httpServer = createServer(appInstance.app);

// Only initialize Socket.IO when chạy dưới dạng server thường (không phải Vercel Function)
if (!process.env.VERCEL) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/ban-ts-comment
    // @ts-ignore – dynamic require; type ignored if module missing at build time
    const { Server: SocketIOServer } = require('socket.io');

    const io: IOServer = new SocketIOServer(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Đăng ký namespace chat
    registerChatSocket(io);

    const PORT = process.env.PORT || process.env.WEBSITES_PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server with Socket.io listening on port ${PORT}`);
    });
}

// Export express app for testing / serverless
export default appInstance.app;
