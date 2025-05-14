declare namespace Express {
    interface Request {
        user: {
            id: string;
            role: UserRole;
            version: number;
        };
    }
}
