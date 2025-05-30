class HttpException extends Error {
    public status: number;
    public message: string;
    public errors?: any[];

    constructor(status: number, message: string, errors: any[] = []) {
        super(message);
        this.name = 'HttpException';
        this.status = status;
        this.message = message;
        this.errors = errors;

        // This is needed to make instanceof work correctly in TypeScript
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}

export default HttpException;
