import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import compression from 'compression';
import 'reflect-metadata'; // Import để sử dụng class-transformer decorators
import { IRoute } from './core/interfaces';
import { errorMiddleware } from './core/middleware';
import { logger } from './core/utils';

// Biến cache connection MongoDB để tái sử dụng trong serverless
// Serverless functions có thể bị khởi tạo lại nhiều lần, cache giúp tái sử dụng connection
let cachedConnection: typeof mongoose | null = null;

export default class App {
    public app: express.Application; // Instance của Express app
    public port: string | number; // Port để chạy server
    public production: boolean; // Flag kiểm tra môi trường production

    constructor(routes: IRoute[]) {
        // Khởi tạo Express application
        this.app = express();

        // Lấy port từ environment variables, ưu tiên PORT, sau đó WEBSITES_PORT, cuối cùng là 3000
        this.port = process.env.PORT || process.env.WEBSITES_PORT || 3000;

        // Kiểm tra có phải môi trường production không
        this.production = !!(process.env.NODE_ENV === 'production');

        // Kết nối database trước khi setup middleware
        this.connectToDatabase();

        // Setup các middleware (cors, compression, security, etc.)
        this.initializeMiddleware();

        // Đăng ký tất cả routes từ các modules
        this.initializeRoute(routes);

        // Setup middleware xử lý lỗi (phải ở cuối cùng)
        this.initializeErrorMiddleware();
    }

    public listen() {
        // Kiểm tra nếu đang chạy trên Vercel thì không cần gọi listen()
        // Vercel tự động handle việc này
        if (process.env.VERCEL) {
            logger.info('Running on Vercel - skipping listen()');
            return;
        }

        // Chỉ gọi listen() khi chạy local hoặc server thường
        this.app.listen(this.port, () => {
            logger.info(`Server is running at port ${this.port}`);
        });
    }

    // Hàm kết nối MongoDB được tối ưu cho serverless
    private async connectToDatabase() {
        // Lấy MongoDB URI từ environment variables
        const mongoDbUri = process.env.MONGODB_URI;
        if (!mongoDbUri) {
            logger.error('MongoDb URI is empty!');
            return;
        }

        // Kiểm tra xem có connection cache không và còn hoạt động không
        // readyState === 1 nghĩa là connected
        if (cachedConnection && cachedConnection.connection.readyState === 1) {
            logger.info('Using cached database connection');
            return cachedConnection; // Tái sử dụng connection cũ
        }

        try {
            // Cấu hình connection options được tối ưu cho serverless từ environment variables
            const options = {
                // Tắt auto-indexing trong production để khởi động nhanh hơn
                // Auto-indexing có thể làm chậm quá trình khởi tạo
                autoIndex: process.env.DB_AUTO_INDEX === 'true',

                // Timeout ngắn hơn phù hợp với serverless environment
                serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT || '5000'),
                connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
                socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000'),

                // Tối ưu connection pooling từ environment variables
                maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
                minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2'),
                maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME || '30000'),

                // Logic retry khi có lỗi từ environment variables
                retryWrites: process.env.DB_RETRY_WRITES === 'true',
                retryReads: process.env.DB_RETRY_READS === 'true',
            };

            // Tạo connection mới và lưu vào cache
            cachedConnection = await mongoose.connect(mongoDbUri, options);
            logger.info('Database connection established successfully');

            // Đăng ký event listeners để handle connection errors
            mongoose.connection.on('error', (err) => {
                logger.error('Database connection error:', err);
                cachedConnection = null; // Xóa cache khi có lỗi
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('Database disconnected');
                cachedConnection = null; // Xóa cache khi mất kết nối
            });

            return cachedConnection;
        } catch (err) {
            logger.error('Database connection failed:', err);
            cachedConnection = null; // Xóa cache khi thất bại

            // Trong serverless environment, không nên throw error nếu DB fail
            // Để app vẫn có thể khởi động và handle requests khác
            if (process.env.VERCEL) {
                logger.warn('Running in Vercel - continuing without database connection');
                return null;
            } else {
                throw err; // Ném lỗi để caller xử lý trong local environment
            }
        }
    }

    // Hàm setup các middleware được tối ưu với environment variables
    private initializeMiddleware() {
        // Compression phải được đặt đầu tiên để nén response với config từ env
        this.app.use(
            compression({
                // Filter function để quyết định có nén hay không
                filter: (req, res) => {
                    // Không nén nếu client yêu cầu
                    if (req.headers['x-no-compression']) {
                        return false;
                    }
                    // Sử dụng filter mặc định của compression
                    return compression.filter(req, res);
                },
                level: parseInt(process.env.COMPRESSION_LEVEL || '6'), // Mức nén từ env
                threshold: parseInt(process.env.COMPRESSION_THRESHOLD || '1024'), // Threshold từ env
            }),
        );

        // Security middleware chỉ chạy trong production
        if (this.production) {
            // HPP (HTTP Parameter Pollution) protection
            this.app.use(hpp());

            // Helmet cho security headers
            this.app.use(
                helmet({
                    contentSecurityPolicy: {
                        directives: {
                            defaultSrc: ["'self'"], // Chỉ cho phép resource từ cùng origin
                            styleSrc: ["'self'", "'unsafe-inline'"], // CSS từ cùng origin + inline
                            scriptSrc: ["'self'"], // JS chỉ từ cùng origin
                            imgSrc: ["'self'", 'data:', 'https:'], // Images từ nhiều nguồn
                        },
                    },
                    crossOriginEmbedderPolicy: false, // Tắt COEP để tương thích
                }),
            );

            // Logging tối ưu cho production - bỏ qua health check và swagger
            this.app.use(
                morgan('combined', {
                    skip: (req) => req.url.includes('/health') || req.url.includes('/swagger'),
                }),
            );

            // CORS với origins từ environment variables
            const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-frontend-domain.com'];
            this.app.use(
                cors({
                    origin: allowedOrigins, // Danh sách domains được phép từ env
                    credentials: true, // Cho phép cookies
                    optionsSuccessStatus: 200, // Status cho preflight requests
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Methods được phép
                    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Headers được phép
                }),
            );
        } else {
            // Development environment - logging đơn giản và CORS mở
            this.app.use(morgan('dev'));
            this.app.use(cors({ origin: true, credentials: true }));
        }

        // Body parsing với giới hạn kích thước
        this.app.use(
            express.json({
                limit: '10mb', // Giới hạn JSON payload 10MB
                verify: (req, res, buf) => {
                    // Lưu raw body để verify webhooks nếu cần
                    (req as any).rawBody = buf;
                },
            }),
        );
        this.app.use(
            express.urlencoded({
                extended: true, // Cho phép parse objects phức tạp
                limit: '10mb', // Giới hạn form data 10MB
            }),
        );

        // Middleware thêm response time header với threshold từ env
        this.app.use((req, res, next) => {
            const start = Date.now(); // Lưu thời gian bắt đầu
            const threshold = parseInt(process.env.RESPONSE_TIME_THRESHOLD || '1000');

            // Override res.end để capture khi response kết thúc
            const originalEnd = res.end;
            let finished = false;

            res.end = function (chunk?: any, encoding?: any) {
                if (!finished) {
                    finished = true;
                    const duration = Date.now() - start; // Tính thời gian xử lý

                    // Chỉ set header nếu headers chưa được gửi
                    if (!res.headersSent) {
                        res.set('X-Response-Time', `${duration}ms`); // Thêm header
                    }

                    // Log warning nếu vượt threshold từ env
                    if (duration > threshold) {
                        logger.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms (threshold: ${threshold}ms)`);
                    }
                }

                // Gọi original end method
                return originalEnd.call(this, chunk, encoding);
            };

            next();
        });

        // Health check endpoint để monitoring
        this.app.get('/health', (req, res) => {
            const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
            const isHealthy = dbStatus === 'connected' || process.env.VERCEL; // In Vercel, allow healthy even if DB disconnected temporarily

            res.status(isHealthy ? 200 : 503).json({
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV,
                database: dbStatus,
                vercel: !!process.env.VERCEL,
            });
        });

        // Middleware kiểm tra database connection cho API requests
        this.app.use('/api', (req, res, next) => {
            // Bỏ qua check cho health endpoint
            if (req.path === '/health') {
                return next();
            }

            // Kiểm tra database connection
            if (mongoose.connection.readyState !== 1) {
                // Trong serverless, thử kết nối lại database
                if (process.env.VERCEL) {
                    logger.warn(`API request to ${req.path} - Database not connected, attempting reconnection`);
                    this.connectToDatabase()
                        .then(() => {
                            if (mongoose.connection.readyState === 1) {
                                next();
                            } else {
                                res.status(503).json({
                                    success: false,
                                    message: 'Database service temporarily unavailable',
                                    error: 'DATABASE_CONNECTION_FAILED',
                                });
                            }
                        })
                        .catch(() => {
                            res.status(503).json({
                                success: false,
                                message: 'Database service temporarily unavailable',
                                error: 'DATABASE_CONNECTION_FAILED',
                            });
                        });
                } else {
                    // Local environment - trả về lỗi ngay
                    res.status(503).json({
                        success: false,
                        message: 'Database service unavailable',
                        error: 'DATABASE_CONNECTION_FAILED',
                    });
                }
            } else {
                next();
            }
        });
    }

    // Middleware xử lý lỗi - phải ở cuối
    private initializeErrorMiddleware() {
        this.app.use(errorMiddleware);
    }

    // Hàm khởi tạo routes được tối ưu với static cache config từ env
    private initializeRoute(routes: IRoute[]) {
        // Đăng ký tất cả routes từ các modules
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });

        // Cấu hình EJS template engine
        this.app.set('view engine', 'ejs');
        // Bật view cache trong production để render nhanh hơn
        this.app.set('view cache', this.production);

        // Đường dẫn tìm views - thứ tự ưu tiên
        this.app.set('views', [
            path.join(__dirname, 'modules/index/view'), // Thư mục view chính
            path.join(__dirname, 'modules/index'), // Backup
            path.join(__dirname, 'modules'), // Fallback
        ]);

        // Cấu hình serve static files với caching từ environment variables
        const staticCacheMaxAge = parseInt(process.env.STATIC_CACHE_MAX_AGE || '31536000');
        const devCacheMaxAge = parseInt(process.env.DEV_CACHE_MAX_AGE || '86400');

        const staticOptions = {
            maxAge: this.production ? staticCacheMaxAge : devCacheMaxAge, // Cache time từ env
            etag: true, // Bật ETag để kiểm tra file thay đổi
            lastModified: true, // Bật Last-Modified header
            setHeaders: (res: express.Response, path: string) => {
                // Set cache headers dựa theo loại file
                if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') || path.endsWith('.jpg')) {
                    // Static assets cache với maxAge từ env
                    res.set('Cache-Control', `public, max-age=${staticCacheMaxAge}, immutable`);
                }
            },
        };

        // Route serve Swagger UI files
        this.app.use('/swagger', express.static(path.join(__dirname, '../node_modules/swagger-ui-dist'), staticOptions));

        // Route serve images
        this.app.use('/images', express.static(path.join(__dirname, '../public/images'), staticOptions));

        // 404 handler cho routes không tồn tại
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.path, // Trả về path để debug
            });
        });
    }
}
