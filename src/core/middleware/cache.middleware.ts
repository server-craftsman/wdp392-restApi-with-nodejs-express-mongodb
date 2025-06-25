import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

/**
 * Interface định nghĩa cấu trúc cho cache entry
 * Mỗi cache entry chứa data và thời gian expire
 */
interface CacheEntry {
    data: any;        // Dữ liệu được cache
    timestamp: number; // Thời gian lưu cache (milliseconds)
    ttl: number;      // Time to live (thời gian sống) tính bằng milliseconds
}

/**
 * Lớp quản lý cache trong memory với configuration từ environment variables
 * Sử dụng Map để lưu trữ data tạm thời trong RAM
 */
class InMemoryCache {
    // Map lưu trữ cache entries với key là string và value là CacheEntry
    private cache = new Map<string, CacheEntry>();

    // Interval timer để dọn dẹp cache entries đã hết hạn
    private cleanupInterval: NodeJS.Timeout;

    // Cấu hình từ environment variables
    private readonly maxEntries: number;
    private readonly debugEnabled: boolean;
    private readonly statsEnabled: boolean;

    constructor() {
        // Lấy cấu hình từ environment variables
        this.maxEntries = parseInt(process.env.CACHE_MAX_ENTRIES || '1000');
        this.debugEnabled = process.env.CACHE_DEBUG_ENABLED === 'true';
        this.statsEnabled = process.env.CACHE_STATS_ENABLED === 'true';

        // Thiết lập interval tự động dọn dẹp cache với thời gian từ env
        const cleanupInterval = parseInt(process.env.CACHE_CLEANUP_INTERVAL || '300000');
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, cleanupInterval);

        // Log thông tin khởi tạo cache nếu debug enabled
        if (this.debugEnabled) {
            logger.debug(`Cache initialized - Max entries: ${this.maxEntries}, Cleanup interval: ${cleanupInterval}ms`);
        }
    }

    /**
     * Lưu data vào cache với key và TTL xác định
     * @param key Cache key - unique identifier cho data
     * @param data Dữ liệu cần cache (có thể là bất kỳ type nào)
     * @param ttl Time to live tính bằng milliseconds (mặc định từ env)
     */
    set(key: string, data: any, ttl: number = parseInt(process.env.CACHE_DEFAULT_TTL || '300000')): void {
        // Kiểm tra giới hạn số lượng entries
        if (this.cache.size >= this.maxEntries) {
            // Xóa entry cũ nhất nếu đã đạt giới hạn
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
                if (this.debugEnabled) {
                    logger.debug(`Cache evicted oldest entry: ${oldestKey} (max entries: ${this.maxEntries})`);
                }
            }
        }

        const entry: CacheEntry = {
            data,                          // Lưu data gốc
            timestamp: Date.now(),         // Thời gian hiện tại
            ttl                           // Thời gian sống
        };

        this.cache.set(key, entry);

        // Log để debug và monitoring nếu debug enabled
        if (this.debugEnabled) {
            logger.debug(`Cache SET: ${key} (TTL: ${ttl}ms, Size: ${this.cache.size}/${this.maxEntries})`);
        }
    }

    /**
     * Lấy data từ cache theo key
     * @param key Cache key cần tìm
     * @returns Data nếu tồn tại và chưa expire, null nếu không có hoặc đã hết hạn
     */
    get(key: string): any {
        const entry = this.cache.get(key);

        // Kiểm tra entry có tồn tại không
        if (!entry) {
            if (this.debugEnabled) {
                logger.debug(`Cache MISS: ${key}`);
            }
            return null;
        }

        // Kiểm tra entry đã hết hạn chưa
        const now = Date.now();
        const ageInMs = now - entry.timestamp;

        if (ageInMs > entry.ttl) {
            // Entry đã hết hạn, xóa khỏi cache
            this.cache.delete(key);
            if (this.debugEnabled) {
                logger.debug(`Cache EXPIRED: ${key} (age: ${ageInMs}ms, ttl: ${entry.ttl}ms)`);
            }
            return null;
        }

        // Entry còn hiệu lực, trả về data
        if (this.debugEnabled) {
            logger.debug(`Cache HIT: ${key} (age: ${ageInMs}ms, TTL remaining: ${entry.ttl - ageInMs}ms)`);
        }
        return entry.data;
    }

    /**
     * Xóa một cache entry theo key
     * @param key Cache key cần xóa
     */
    delete(key: string): void {
        const deleted = this.cache.delete(key);
        if (deleted && this.debugEnabled) {
            logger.debug(`Cache DELETE: ${key} (Size: ${this.cache.size}/${this.maxEntries})`);
        }
    }

    /**
     * Xóa toàn bộ cache
     * Thường dùng khi cần reset cache hoặc memory cleanup
     */
    clear(): void {
        const sizeBefore = this.cache.size;
        this.cache.clear();
        logger.info(`Cache CLEAR: Removed ${sizeBefore} entries`);
    }

    /**
     * Dọn dẹp các cache entries đã hết hạn
     * Method này được gọi tự động theo interval từ env
     */
    private cleanup(): void {
        const now = Date.now();
        let removedCount = 0;
        let totalEntries = 0;

        // Duyệt qua tất cả entries để kiểm tra expire
        for (const [key, entry] of this.cache.entries()) {
            totalEntries++;
            const ageInMs = now - entry.timestamp;

            // Nếu entry đã hết hạn thì xóa
            if (ageInMs > entry.ttl) {
                this.cache.delete(key);
                removedCount++;
            }
        }

        // Log thông tin cleanup nếu có entries bị xóa hoặc stats enabled
        if (removedCount > 0) {
            logger.info(`Cache CLEANUP: Removed ${removedCount}/${totalEntries} expired entries. Current size: ${this.cache.size}/${this.maxEntries}`);
        } else if (this.statsEnabled && totalEntries > 0) {
            logger.debug(`Cache CLEANUP: No expired entries. Current size: ${this.cache.size}/${this.maxEntries}`);
        }
    }

    /**
     * Lấy thông tin thống kê về cache với config từ env
     * @returns Object chứa thông tin size và memory usage
     */
    getStats() {
        const memoryUsage = process.memoryUsage();
        const stats = {
            size: this.cache.size,                    // Số lượng entries hiện tại
            maxEntries: this.maxEntries,              // Giới hạn entries từ env
            memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // Memory usage in MB
            hitRatio: this.calculateHitRatio(),       // Tỷ lệ cache hit
            configuredTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300000'), // TTL mặc định từ env
            cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || '300000'), // Cleanup interval từ env
            debugEnabled: this.debugEnabled,          // Trạng thái debug từ env
            statsEnabled: this.statsEnabled           // Trạng thái stats từ env
        };

        if (this.statsEnabled) {
            logger.info(`Cache Stats: ${JSON.stringify(stats)}`);
        }

        return stats;
    }

    /**
     * Tính tỷ lệ cache hit (ước tính)
     * @returns Tỷ lệ cache hit từ 0 đến 1
     */
    private calculateHitRatio(): number {
        // Ước tính dựa trên số entries hiện tại so với max entries
        // Đây là một ước tính đơn giản, có thể cải thiện bằng cách track hits/misses
        return this.cache.size > 0 ? Math.min(this.cache.size / this.maxEntries, 1) : 0;
    }

    /**
     * Cleanup khi app shutdown
     * Dọn dẹp interval timer để tránh memory leaks
     */
    destroy(): void {
        clearInterval(this.cleanupInterval);
        this.clear();
        logger.info('Cache destroyed');
    }
}

// Singleton instance của cache
// Sử dụng pattern này để đảm bảo chỉ có 1 cache instance trong toàn app
const cache = new InMemoryCache();

/**
 * Middleware function để cache API responses với TTL từ env
 * @param ttl Time to live cho cache entry (mặc định từ env)
 * @returns Express middleware function
 */
export const cacheMiddleware = (ttl?: number) => {
    // Sử dụng TTL từ parameter hoặc từ environment variable
    const cacheTTL = ttl || parseInt(process.env.CACHE_DEFAULT_TTL || '300000');

    return (req: Request, res: Response, next: NextFunction) => {
        // Chỉ cache GET requests - những request không thay đổi data
        if (req.method !== 'GET') {
            return next();
        }

        // Tạo unique cache key từ URL và query parameters
        const key = generateCacheKey(req);

        // Thử lấy data từ cache trước
        const cachedData = cache.get(key);

        if (cachedData) {
            // Cache hit - trả về data từ cache
            logger.info(`Cache hit for ${req.originalUrl}`);

            // Thêm header để client biết response từ cache
            res.set('X-Cache', 'HIT');
            res.set('X-Cache-Key', key);
            res.set('X-Cache-TTL', cacheTTL.toString());

            return res.json(cachedData);
        }

        // Cache miss - cần gọi API và cache kết quả
        logger.info(`Cache miss for ${req.originalUrl}`);

        // Backup original res.json method
        const originalJson = res.json.bind(res);

        // Override res.json để intercept response data
        res.json = function (body: any) {
            // Cache response data nếu status code thành công (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, body, cacheTTL);
                logger.debug(`Cached response for ${req.originalUrl} with TTL ${cacheTTL}ms`);

                // Thêm headers để debug
                res.set('X-Cache', 'MISS');
                res.set('X-Cache-Key', key);
                res.set('X-Cache-TTL', cacheTTL.toString());
            }

            // Gọi original json method để trả response
            return originalJson(body);
        };

        // Tiếp tục với middleware/controller tiếp theo
        next();
    };
};

/**
 * Middleware để cache response có điều kiện với TTL từ env
 * Chỉ cache khi thỏa mãn các điều kiện nhất định
 * @param condition Function kiểm tra điều kiện cache
 * @param ttl Time to live cho cache (mặc định từ env)
 * @returns Express middleware function
 */
export const conditionalCache = (
    condition: (req: Request, res: Response) => boolean,
    ttl?: number
) => {
    const cacheTTL = ttl || parseInt(process.env.CACHE_DEFAULT_TTL || '300000');

    return (req: Request, res: Response, next: NextFunction) => {
        // Chỉ cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Kiểm tra điều kiện cache
        if (!condition(req, res)) {
            logger.debug(`Skipping cache for ${req.originalUrl} - condition not met`);
            return next();
        }

        // Áp dụng cache middleware nếu thỏa điều kiện
        return cacheMiddleware(cacheTTL)(req, res, next);
    };
};

/**
 * Middleware để invalidate (xóa) cache dựa trên patterns
 * Thường dùng cho POST/PUT/DELETE requests để xóa cache liên quan
 * @param patterns Array của regex patterns để match cache keys cần xóa
 * @returns Express middleware function
 */
export const invalidateCache = (patterns: RegExp[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Backup original response methods
        const originalJson = res.json.bind(res);
        const originalSend = res.send.bind(res);

        // Function để thực hiện cache invalidation
        const performInvalidation = () => {
            // Chỉ invalidate nếu response thành công
            if (res.statusCode >= 200 && res.statusCode < 300) {
                let invalidatedCount = 0;

                // Duyệt qua tất cả cache entries
                for (const key of (cache as any).cache.keys()) {
                    // Kiểm tra key có match với patterns không
                    for (const pattern of patterns) {
                        if (pattern.test(key)) {
                            cache.delete(key);
                            invalidatedCount++;
                            break; // Thoát khỏi vòng lặp patterns
                        }
                    }
                }

                if (invalidatedCount > 0) {
                    logger.info(`Invalidated ${invalidatedCount} cache entries for ${req.originalUrl}`);
                }
            }
        };

        // Override res.json để trigger invalidation
        res.json = function (body: any) {
            performInvalidation();
            return originalJson(body);
        };

        // Override res.send để trigger invalidation
        res.send = function (body: any) {
            performInvalidation();
            return originalSend(body);
        };

        // Tiếp tục với middleware/controller tiếp theo
        next();
    };
};

/**
 * Tạo unique cache key từ request
 * Key format: METHOD:PATH:QUERY_HASH
 * @param req Express Request object
 * @returns Unique cache key string
 */
function generateCacheKey(req: Request): string {
    // Lấy base path (không bao gồm query parameters)
    const basePath = req.path;

    // Convert query object thành JSON string để hash
    const queryString = JSON.stringify(req.query, Object.keys(req.query).sort());

    // Tạo hash từ query string để rút ngắn key
    const queryHash = crypto
        .createHash('md5')
        .update(queryString)
        .digest('hex')
        .substring(0, 8); // Chỉ lấy 8 ký tự đầu để ngắn gọn

    // Format: GET:/api/users:a1b2c3d4
    return `${req.method}:${basePath}:${queryHash}`;
}

/**
 * Middleware để thêm cache control headers với config từ env
 * Giúp browser và CDN cache responses
 * @param maxAge Thời gian cache ở browser (seconds) - mặc định từ env
 * @param sMaxAge Thời gian cache ở CDN (seconds) - mặc định từ env
 * @returns Express middleware function
 */
export const cacheHeaders = (maxAge?: number, sMaxAge?: number) => {
    // Lấy giá trị từ environment variables nếu không được cung cấp
    const browserMaxAge = maxAge || parseInt(process.env.CACHE_BROWSER_MAX_AGE || '300');
    const cdnMaxAge = sMaxAge || parseInt(process.env.CACHE_CDN_MAX_AGE || '600');

    return (req: Request, res: Response, next: NextFunction) => {
        // Chỉ thêm headers cho GET requests
        if (req.method === 'GET') {
            const cacheControl = [
                `public`,                                    // Có thể cache bởi browser và proxy
                `max-age=${browserMaxAge}`                   // Cache time ở browser từ env
            ];

            // Thêm s-maxage cho CDN/proxy từ env
            if (cdnMaxAge) {
                cacheControl.push(`s-maxage=${cdnMaxAge}`);
            }

            res.set('Cache-Control', cacheControl.join(', '));

            // Thêm ETag để validation
            res.set('ETag', `"${Date.now()}"`);

            // Thêm header cho monitoring
            res.set('X-Cache-Config', `browser:${browserMaxAge}s,cdn:${cdnMaxAge}s`);
        }

        next();
    };
};

/**
 * Utility function để manually clear cache
 * Có thể dùng trong admin endpoints hoặc scheduled jobs
 */
export const clearCache = () => {
    cache.clear();
};

/**
 * Utility function để get cache statistics với config từ env
 * Hữu ích cho monitoring và debugging
 * @returns Object chứa thống kê cache
 */
export const getCacheStats = () => {
    return cache.getStats();
};

/**
 * Cleanup function để gọi khi app shutdown
 * Đảm bảo cleanup proper để tránh memory leaks
 */
export const destroyCache = () => {
    cache.destroy();
};

// Export default cache middleware với TTL từ env
export default cacheMiddleware; 