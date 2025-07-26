import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../../modules/auth';
import { UserRole, UserSchema } from '../../modules/user';
import { HttpStatus } from '../enums';
import { logger } from '../utils';

// List of paths that should bypass authentication
const PUBLIC_PATHS = ['/docs', '/docs/', '/docs.json', '/swagger', '/swagger/'];

const authMiddleWare = (roles?: UserRole[], isClient = false): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        // kiểm tra xem đường dẫn có nằm trong danh sách các đường dẫn public không
        const path = req.path;
        // nếu có thì cho phép truy cập
        if (PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))) {
            next(); // chuyển tiếp đến middleware tiếp theo
            return;
        }

        const authHeader = req.headers['authorization'];

        if (isClient) {
            if (!authHeader) {
                req.user = { id: '', role: null, version: 0 };
                next();
                return;
            }
        } else {
            if (!authHeader) {
                res.status(HttpStatus.NotFound).json({ message: 'No token, authorization denied.' });
                return;
            }
        }

        handleCheckToken(req, res, next, authHeader, roles).catch(next);
    };
};

const handleCheckToken = async (req: Request, res: Response, next: NextFunction, authHeader: string | undefined, roles?: UserRole[]) => {
    const userSchema = UserSchema;
    if (authHeader) {
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        if (!token) {
            res.status(HttpStatus.NotFound).json({ message: 'No token, authorization denied.' });
            return;
        }

        try {
            const userToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET ?? '') as DataStoredInToken;
            if (!req.user) {
                req.user = { id: '', role: null, version: 0 };
            }
            req.user.id = userToken.id;
            req.user.role = userToken.role;
            req.user.version = userToken.version;

            // check user version
            const user = await userSchema.findOne({ _id: userToken.id, is_deleted: false, is_verified: true }).lean();
            if (!user || Number(user?.token_version?.toString() || 0) !== userToken.version) {
                res.status(HttpStatus.Forbidden).json({ message: 'Access denied: invalid token!' });
                return;
            }

            // check roles if provided
            if (roles && roles.length > 0 && !roles.includes(req.user.role)) {
                res.status(HttpStatus.Forbidden).json({ message: 'Access denied: insufficient role' });
                return;
            }

            next();
        } catch (error) {
            logger.error(`[ERROR] Msg: ${token}`);
            if (error instanceof Error) {
                if (error.name === 'TokenExpiredError') {
                    res.status(HttpStatus.Forbidden).json({ message: 'Token is expired' });
                } else {
                    res.status(HttpStatus.Forbidden).json({ message: 'Token is not valid' });
                }
            } else {
                res.status(HttpStatus.InternalServerError).json({ message: 'An unknown error occurred' });
            }
        }
    }
};

export default authMiddleWare;
