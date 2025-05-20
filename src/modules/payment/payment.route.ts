import { Router } from 'express';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import PaymentController from './payment.controller';
import { CreatePayosPaymentDto } from './dtos/create-payos-payment.dto';

export default class PaymentRoute implements IRoute {
    public path = '/api/payment';
    public router = Router();
    public paymentController = new PaymentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Tạo thanh toán PayOS
        this.router.post(
            `${this.path}/payos`,
            authMiddleWare(),
            validationMiddleware(CreatePayosPaymentDto),
            this.paymentController.createPayosPayment
        );

        // Webhook nhận callback từ PayOS
        this.router.post(
            `${this.path}/payos/webhook`,
            this.paymentController.payosWebhook
        );
    }
}
