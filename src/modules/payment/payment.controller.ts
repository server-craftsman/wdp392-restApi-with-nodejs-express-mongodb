import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import PaymentService from './payment.service';

export default class PaymentController {
    private paymentService = new PaymentService();

    /**
     * Create VNPAY payment URL
     */
    public createVnpayPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get client IP address
            const ipAddr = req.headers['x-forwarded-for'] as string ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                '127.0.0.1';

            const paymentDto: CreatePaymentDto = req.body;
            const paymentUrl = await this.paymentService.createPayment(req.user.id, paymentDto, ipAddr);

            // Return payment URL to frontend
            res.status(HttpStatus.Success).json(formatResponse<{ paymentUrl: string }>({ paymentUrl }));
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handle VNPAY IPN (Instant Payment Notification)
     */
    public vnpayIpn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.paymentService.processVnpayIpn(req.query);
            res.status(HttpStatus.Success).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handle VNPAY Return URL
     */
    public vnpayReturn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.paymentService.processVnpayReturn(req.query);

            // You can render a success/failure page or redirect to a client URL
            if (result.success) {
                res.status(HttpStatus.Success).json(formatResponse(result));
            } else {
                res.status(HttpStatus.BadRequest).json(formatResponse({ error: result.message }, false));
            }
        } catch (error) {
            next(error);
        }
    };
} 