# 🚀 Tối ưu Performance cho Vercel | Vercel Performance Optimization

## 📋 Tổng quan | Overview

## ⚡ Các cải tiến đã thực hiện | Implemented Optimizations

### 1. 🔧 **Cấu hình Vercel.json nâng cao**

```json
{
    "version": 2,
    "builds": [
        {
            "src": "src/server.ts",
            "use": "@vercel/node",
            "config": {
                "includeFiles": ["src/**", "swagger.yaml", "assets/**"]
            }
        }
    ],
    "functions": {
        "src/server.ts": {
            "maxDuration": 30
        }
    }
}
```

**Tính năng:**
- **Route-specific caching**: Các endpoint khác nhau có cache riêng biệt
- **Static asset optimization**: Cache lâu dài cho swagger, images
- **Security headers**: Bảo mật tự động cho tất cả API routes
- **Function timeout**: Tăng thời gian xử lý lên 30s

### 2. 🗄️ **Tối ưu MongoDB Connection**

```typescript
// Cached connection cho serverless
let cachedConnection: typeof mongoose | null = null;

private async connectToDatabase() {
    // Sử dụng connection cache
    if (cachedConnection && cachedConnection.connection.readyState === 1) {
        return cachedConnection;
    }

    const options = {
        // Connection pooling optimization
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        // Serverless optimization
        bufferCommands: false,
        bufferMaxEntries: 0,
        // Faster timeouts
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000
    };
}
```

**Lợi ích:**
- **Connection reuse**: Tái sử dụng kết nối giữa các function calls
- **Faster cold starts**: Khởi động nhanh hơn với buffer optimization
- **Better pooling**: Quản lý connection pool hiệu quả

### 3. 💾 **In-Memory Caching System**

```typescript
// Cache middleware cho API responses
export const cacheMiddleware = (options: CacheOptions) => {
    // Tự động cache GET requests
    // TTL configurable per route
    // Condition-based caching
};

// Pre-configured cache cho các loại data
export const serviceCacheMiddleware = cacheMiddleware({
    ttl: 5 * 60 * 1000, // 5 phút
    condition: (req) => !req.headers.authorization
});

export const blogCacheMiddleware = cacheMiddleware({
    ttl: 3 * 60 * 1000, // 3 phút
});
```

**Áp dụng:**
```typescript
// Trong routes
router.get('/api/service', serviceCacheMiddleware, controller.getServices);
router.get('/api/blog', blogCacheMiddleware, controller.getBlogs);
```

### 4. 📊 **Performance Monitoring**

```typescript
// Database query optimization
const optimizedResults = DatabaseOptimizer.paginate(
    UserModel.find(filter),
    page,
    limit,
    { created_at: -1 }
);

// Performance tracking
const result = await PerformanceMonitor.monitor(
    'getUserData',
    () => userService.getData(userId)
);

// Memory management
MemoryManager.logMemoryUsage('After DB Query');
```

## 🎯 **Cách sử dụng tối ưu | How to Use Optimizations**

### **Bước 1: Cập nhật Routes với Cache**

```typescript
// TRƯỚC (Before) - No optimization
import { Router } from 'express';
import { authMiddleWare } from '../../core/middleware';

this.router.get(
    `${this.path}`,
    authMiddleWare([UserRoleEnum.ADMIN]),
    this.controller.listCases
);

// SAU (After) - With caching optimization  
import { Router } from 'express';
import { authMiddleWare } from '../../core/middleware';
import { cacheMiddleware } from '../../core/middleware/cache.middleware';

// Cache cho public data
const publicCacheMiddleware = cacheMiddleware({
    ttl: 5 * 60 * 1000, // 5 phút
    condition: (req) => !req.headers.authorization
});

// Cache cho authenticated data
const adminCacheMiddleware = cacheMiddleware({
    ttl: 2 * 60 * 1000, // 2 phút  
    condition: (req) => req.method === 'GET'
});

this.router.get(
    `${this.path}`,
    authMiddleWare([UserRoleEnum.ADMIN]),
    adminCacheMiddleware,
    this.controller.listCases
);
```

### **Bước 2: Tối ưu Database Queries**

```typescript
// TRƯỚC (Before) - Standard query
async listCases(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    const cases = await AdministrativeCase.find()
        .skip((page - 1) * limit)
        .limit(limit);
    
    const total = await AdministrativeCase.countDocuments();
    return res.json({ cases, total });
}

// SAU (After) - With optimization
async listCases(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    
    // Sử dụng DatabaseOptimizer
    const query = AdministrativeCase.find();
    const optimizedResults = await DatabaseOptimizer.paginate(
        query,
        Number(page),
        Number(limit),
        { created_at: -1 } // sort
    );
    
    // Tracking performance
    const result = await PerformanceMonitor.monitor('listCases', () => {
        return optimizedResults;
    });
    
    return res.json(result);
}
```

### **Bước 3: Optimized Service Layer**

```typescript
// service.ts - Với performance monitoring
class AdministrativeCasesService {
    
    async getCases(filters: any = {}, page: number = 1, limit: number = 10) {
        // Memory logging trước query
        MemoryManager.logMemoryUsage('Before DB Query');
        
        // Optimized query với lean() và select()
        let query = AdministrativeCase.find(filters);
        query = DatabaseOptimizer.lean(query);
        query = DatabaseOptimizer.select(query, 'title status created_at updated_at');
        
        const results = await DatabaseOptimizer.paginate(
            query, 
            page, 
            limit,
            { created_at: -1 }
        );
        
        // Memory logging sau query
        MemoryManager.logMemoryUsage('After DB Query');
        
        return results;
    }
    
    async getCaseById(id: string) {
        // Performance tracking cho single query
        return await PerformanceMonitor.monitor('getCaseById', async () => {
            let query = AdministrativeCase.findById(id);
            query = DatabaseOptimizer.lean(query);
            return await query.exec();
        });
    }
}
```

## 🚀 **Performance Best Practices**

### **1. Cache Strategy**

```typescript
// Cache levels theo độ ưu tiên
export const CacheStrategies = {
    // Public data - cache lâu nhất
    PUBLIC: { ttl: 10 * 60 * 1000, condition: (req) => !req.headers.authorization },
    
    // User-specific data - cache trung bình  
    USER: { ttl: 5 * 60 * 1000, condition: (req) => req.method === 'GET' },
    
    // Admin data - cache ngắn
    ADMIN: { ttl: 2 * 60 * 1000, condition: (req) => req.method === 'GET' },
    
    // Real-time data - không cache
    REALTIME: { ttl: 0 }
};
```

### **2. Database Query Patterns**

```typescript
// ✅ TỐT - Optimized query
const optimizedQuery = async () => {
    return await DatabaseOptimizer.paginate(
        Model.find(filter)
            .lean() // Faster object creation
            .select('field1 field2') // Only needed fields
            .populate('relation', 'name'), // Limited populate
        page,
        limit,
        { created_at: -1 }
    );
};

// ❌ TRÁNH - Non-optimized query
const slowQuery = async () => {
    const docs = await Model.find(filter); // Full objects
    const total = await Model.countDocuments(filter); // Separate count
    return { docs, total };
};
```

### **3. Memory Management**

```typescript
// Monitor memory usage trong critical operations
const performCriticalOperation = async () => {
    MemoryManager.logMemoryUsage('Start Operation');
    
    // Large data processing
    const results = await heavyDataProcessing();
    
    MemoryManager.logMemoryUsage('After Processing');
    
    // Clear memory if needed
    if (process.memoryUsage().heapUsed > 100 * 1024 * 1024) { // 100MB
        global.gc && global.gc();
        MemoryManager.logMemoryUsage('After GC');
    }
    
    return results;
};
```

## 📈 **Monitoring & Analytics**

### **Performance Metrics Dashboard**

```typescript
// Custom metrics tracking
app.get('/api/admin/performance', async (req, res) => {
    const metrics = {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        
        // Database connection status
        database: {
            status: PerformanceMonitor.getPoolStatus(),
            activeQueries: DatabaseOptimizer.getActiveQueries()
        },
        
        // Cache statistics
        cache: CacheManager.getStats(),
        
        // Recent performance logs
        recentLogs: PerformanceMonitor.getRecentLogs(10)
    };
    
    res.json(metrics);
});
```

## 🔧 **Environment Configuration**

### **Production Environment Variables**

```bash
# .env.production
NODE_ENV=production

# Database optimization
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
MONGODB_MAX_IDLE_TIME=30000

# Caching
CACHE_TTL_DEFAULT=300000  # 5 minutes
CACHE_MAX_SIZE=100        # Max cached items

# Performance
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_MEMORY_LOGGING=true
GC_INTERVAL=60000         # Garbage collection interval

# Vercel specific
VERCEL_REGION=hkg1        # Hong Kong for Asia optimization
```

### **Package.json Scripts**

```json
{
    "scripts": {
        "start": "node dist/server.js",
        "build": "tsc && npm run copy-assets",
        "copy-assets": "cp -r assets dist/ && cp swagger.yaml dist/",
        "dev": "nodemon src/server.ts",
        "vercel-build": "npm run build",
        "test:performance": "node scripts/performance-test.js"
    }
}
```

## 🎯 **Deployment Checklist**

### **Pre-deployment**

- [ ] ✅ Verify `vercel.json` configuration
- [ ] ✅ Check environment variables
- [ ] ✅ Test caching middleware
- [ ] ✅ Validate database connection pooling
- [ ] ✅ Performance test critical endpoints
### Validate Password Security
- [ ] ✅ Test password security configuration
- [ ] ✅ Verify BCRYPT_SALT_ROUNDS setting
- [ ] ✅ Check password validation rules from env
- [ ] ✅ Test password hashing performance
- [ ] ✅ Validate security headers configuration


### **Post-deployment**

- [ ] 📊 Monitor `/api/admin/performance` endpoint
- [ ] 🔍 Check Vercel function logs
- [ ] ⚡ Test response times for cached vs uncached
- [ ] 💾 Verify memory usage patterns
- [ ] 🔄 Test pagination performance

## 📞 **Support & Troubleshooting**

### **Common Issues**

1. **High memory usage**: Enable garbage collection and monitor heap size
2. **Slow database queries**: Use `DatabaseOptimizer.lean()` and proper indexing
3. **Cache not working**: Check middleware order and cache conditions
4. **Connection timeouts**: Verify MongoDB connection pool settings

### **Debug Commands**

```bash
# Check memory usage
curl https://your-api.vercel.app/api/admin/performance

# Test specific endpoint performance
time curl https://your-api.vercel.app/api/your-endpoint

# View Vercel function logs
vercel logs your-function-name
```

---
