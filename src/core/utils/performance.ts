import mongoose from 'mongoose';
import logger from './logger';

/**
 * Lớp tiện ích tối ưu Database queries
 * Giúp cải thiện hiệu suất truy vấn MongoDB
 */
export class DatabaseOptimizer {
    /**
     * Thêm .lean() vào mongoose queries để tăng hiệu suất
     * .lean() trả về plain JavaScript objects thay vì Mongoose documents
     * Nhanh hơn vì không có getters/setters và validation
     * @param query Mongoose query object
     * @returns Query đã được tối ưu
     */
    static lean(query: any): any {
        return query.lean();
    }

    /**
     * Thêm projection để giới hạn fields trả về
     * Chỉ lấy những fields cần thiết để giảm bandwidth và memory
     * @param query Mongoose query object
     * @param fields Chuỗi các fields cần lấy (vd: 'name email created_at')
     * @returns Query với projection
     */
    static select(query: any, fields: string): any {
        return query.select(fields);
    }

    /**
     * Tối ưu pagination queries với validation và lean()
     * Tự động thêm sort, skip, limit và lean() cho hiệu suất tối đa
     * @param query Base query chưa có pagination
     * @param page Số trang (bắt đầu từ 1)
     * @param limit Số items mỗi trang
     * @param sort Tiêu chí sắp xếp (mặc định theo created_at giảm dần)
     * @returns Query đã được tối ưu với pagination
     */
    static paginate(query: any, page: number = 1, limit: number = 10, sort: any = { created_at: -1 }): any {
        // Tính số documents cần skip, đảm bảo không âm
        const skip = Math.max(0, (page - 1) * limit);

        // Giới hạn limit trong khoảng 1-100 để tránh overload
        const validLimit = Math.min(Math.max(1, limit), 100);

        return query
            .sort(sort) // Sắp xếp trước
            .skip(skip) // Bỏ qua documents của các trang trước
            .limit(validLimit) // Giới hạn số documents trả về
            .lean(); // Trả về plain objects để tăng tốc
    }

    /**
     * Tạo optimized count query
     * Sử dụng countDocuments() thay vì count() (deprecated)
     * @param model Mongoose model
     * @param filter Điều kiện filter (mặc định là rỗng)
     * @returns Promise trả về số lượng documents
     */
    static count(model: mongoose.Model<any>, filter: any = {}) {
        return model.countDocuments(filter);
    }

    /**
     * Xử lý batch cho datasets lớn để tránh memory overflow
     * Chia nhỏ dữ liệu thành các batch và xử lý tuần tự
     * @param model Mongoose model
     * @param filter Điều kiện filter
     * @param processor Hàm xử lý mỗi batch
     * @param batchSize Kích thước mỗi batch (mặc định 100)
     */
    static async batchProcess(model: mongoose.Model<any>, filter: any, processor: (batch: any[]) => Promise<void>, batchSize: number = 100): Promise<void> {
        let skip = 0; // Số documents đã xử lý
        let hasMore = true; // Flag kiểm tra còn data không

        while (hasMore) {
            // Lấy một batch documents
            const batch = await model
                .find(filter)
                .skip(skip)
                .limit(batchSize)
                .lean() // Sử dụng lean() để tăng tốc
                .exec();

            // Nếu không có data thì dừng
            if (batch.length === 0) {
                hasMore = false;
                break;
            }

            // Xử lý batch hiện tại
            await processor(batch);
            skip += batchSize;

            // Nếu batch nhỏ hơn batchSize thì đây là batch cuối
            if (batch.length < batchSize) {
                hasMore = false;
            }
        }
    }
}

/**
 * Lớp tiện ích monitoring hiệu suất
 * Giúp đo thời gian thực thi và log performance
 */
export class PerformanceMonitor {
    // Map lưu trữ thời gian bắt đầu của các timers
    private static timers = new Map<string, number>();

    /**
     * Bắt đầu đo thời gian cho một operation
     * @param label Tên của timer để identify
     */
    static start(label: string): void {
        this.timers.set(label, Date.now());
    }

    /**
     * Kết thúc đo thời gian và log kết quả
     * @param label Tên timer cần kết thúc
     * @param logLevel Mức độ log (info/warn/error)
     * @returns Thời gian thực thi tính bằng milliseconds
     */
    static end(label: string, logLevel: 'info' | 'warn' | 'error' = 'info'): number {
        const startTime = this.timers.get(label);

        // Kiểm tra timer có tồn tại không
        if (!startTime) {
            logger.warn(`Timer '${label}' was not started`);
            return 0;
        }

        // Tính thời gian thực thi
        const duration = Date.now() - startTime;

        // Xóa timer khỏi map để tiết kiệm memory
        this.timers.delete(label);

        const message = `${label} completed in ${duration}ms`;

        // Log theo mức độ tương ứng
        switch (logLevel) {
            case 'warn':
                // Chỉ warn nếu > 1 giây
                if (duration > 1000) logger.warn(message);
                break;
            case 'error':
                // Chỉ error nếu > 3 giây
                if (duration > 3000) logger.error(message);
                break;
            default:
                logger.info(message);
        }

        return duration;
    }

    /**
     * Monitor một async function và tự động đo thời gian
     * Wrapper function để tự động start/end timer
     * @param label Tên để identify operation
     * @param fn Async function cần monitor
     * @returns Kết quả của function gốc
     */
    static async monitor<T>(label: string, fn: () => Promise<T>): Promise<T> {
        this.start(label); // Bắt đầu đo thời gian
        try {
            const result = await fn(); // Thực thi function
            this.end(label); // Kết thúc thành công
            return result;
        } catch (error) {
            this.end(label, 'error'); // Kết thúc với lỗi
            throw error; // Re-throw error để caller xử lý
        }
    }

    /**
     * Tạo middleware tracking thời gian response
     * Middleware Express để đo thời gian xử lý request
     * @param threshold Ngưỡng cảnh báo (ms), mặc định 1000ms
     */
    static middleware(threshold: number = 1000) {
        return (req: any, res: any, next: any) => {
            const start = Date.now();
            const label = `${req.method} ${req.path}`;

            // Lắng nghe event 'finish' khi response được gửi
            res.on('finish', () => {
                const duration = Date.now() - start;

                // Thêm header response time
                res.set('X-Response-Time', `${duration}ms`);

                // Log warning nếu vượt ngưỡng
                if (duration > threshold) {
                    logger.warn(`Slow request: ${label} took ${duration}ms`);
                } else {
                    logger.info(`${label} completed in ${duration}ms`);
                }
            });

            next(); // Tiếp tục với middleware tiếp theo
        };
    }
}

/**
 * Lớp quản lý memory cho serverless environments
 * Giúp monitor và quản lý việc sử dụng bộ nhớ
 */
export class MemoryManager {
    /**
     * Ép buộc garbage collection nếu có thể
     * Chỉ hoạt động khi Node.js được start với flag --expose-gc
     */
    static forceGC(): void {
        if (global.gc) {
            global.gc(); // Gọi garbage collector
            logger.info('Forced garbage collection');
        }
    }

    /**
     * Lấy thông tin sử dụng memory hiện tại
     * Chuyển đổi từ bytes sang MB để dễ đọc
     * @returns Object chứa thông tin memory usage
     */
    static getMemoryUsage() {
        const usage = process.memoryUsage();
        return {
            // RSS: Resident Set Size - tổng memory được process sử dụng
            rss: Math.round((usage.rss / 1024 / 1024) * 100) / 100,

            // Heap Total: Tổng heap memory được allocate
            heapTotal: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100,

            // Heap Used: Heap memory đang được sử dụng
            heapUsed: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100,

            // External: Memory được sử dụng bởi C++ objects liên kết với JS objects
            external: Math.round((usage.external / 1024 / 1024) * 100) / 100,
        };
    }

    /**
     * Log thông tin memory usage với context
     * @param context Mô tả ngữ cảnh để debug (vd: 'After DB Query')
     */
    static logMemoryUsage(context: string = 'Memory Usage'): void {
        const usage = this.getMemoryUsage();
        logger.info(`${context} - RSS: ${usage.rss}MB, Heap: ${usage.heapUsed}/${usage.heapTotal}MB, External: ${usage.external}MB`);
    }

    /**
     * Kiểm tra xem memory usage có đang tiến gần giới hạn không
     * @param maxHeapMB Giới hạn heap memory tối đa (MB), mặc định 500MB
     * @returns true nếu vượt ngưỡng, false nếu còn an toàn
     */
    static checkMemoryLimits(maxHeapMB: number = 500): boolean {
        const usage = this.getMemoryUsage();
        if (usage.heapUsed > maxHeapMB) {
            logger.warn(`High memory usage detected: ${usage.heapUsed}MB (limit: ${maxHeapMB}MB)`);
            return true; // Vượt ngưỡng
        }
        return false; // Còn an toàn
    }
}

/**
 * Lớp tối ưu Connection Pool cho MongoDB
 * Monitor và log trạng thái connection pool
 */
export class ConnectionPoolOptimizer {
    /**
     * Lấy thông tin trạng thái connection pool
     * @returns Object chứa thông tin connection status
     */
    static getPoolStatus() {
        return {
            // Kiểm tra connection có đang hoạt động không (1 = connected)
            isConnected: mongoose.connection.readyState === 1,

            // Trạng thái connection: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
            readyState: mongoose.connection.readyState,

            // Host đang kết nối
            host: mongoose.connection.host,

            // Tên database
            name: mongoose.connection.name,
        };
    }

    /**
     * Log thông tin pool status để monitoring
     */
    static logPoolStatus(): void {
        const status = this.getPoolStatus();
        logger.info(`DB Pool Status - Connected: ${status.isConnected}, State: ${status.readyState}, Host: ${status.host}, DB: ${status.name}`);
    }
}

/**
 * Lớp tiện ích tối ưu cho serverless environments
 * Detect và handle các đặc thù của serverless platforms
 */
export class ServerlessOptimizer {
    /**
     * Kiểm tra có đang chạy trong serverless environment không
     * @returns true nếu đang chạy trên serverless platform
     */
    static isServerless(): boolean {
        return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
    }

    /**
     * Lấy thông tin chi tiết về serverless environment
     * @returns Object chứa thông tin platform và region
     */
    static getServerlessInfo() {
        return {
            isServerless: this.isServerless(),

            // Detect platform dựa trên environment variables
            platform: process.env.VERCEL ? 'Vercel' : process.env.AWS_LAMBDA_FUNCTION_NAME ? 'AWS Lambda' : process.env.NETLIFY ? 'Netlify' : 'Unknown',

            // Region đang chạy
            region: process.env.VERCEL_REGION || process.env.AWS_REGION || 'unknown',

            // Có phải cold start không (function mới được khởi tạo)
            coldStart: !global.__serverless_cache_initialized,
        };
    }

    /**
     * Đánh dấu cache đã được khởi tạo (warm start)
     * Giúp identify cold starts vs warm starts
     */
    static initializeCache(): void {
        global.__serverless_cache_initialized = true;
    }

    /**
     * Cleanup resources khi serverless function kết thúc
     * Đóng connections và giải phóng memory
     */
    static cleanup(): void {
        // Đóng MongoDB connection nếu đang mở
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }

        // Ép buộc garbage collection để giải phóng memory
        MemoryManager.forceGC();
    }
}

// Declare global type cho cache flag
// Biến global để track trạng thái cache initialization
declare global {
    var __serverless_cache_initialized: boolean;
}
