import { Router } from 'express';
import { API_PATH } from '../../core/constants';
import { IRoute } from '../../core/interfaces';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import PaymentController from './payment.controller';
import { CreatePaymentDto } from './dtos/create-payment.dto';

export default class PaymentRoute implements IRoute {
    public path = API_PATH.PAYMENT;
    public router = Router();
    public paymentController = new PaymentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // POST domain:/api/payment/vnpay -> Create VNPAY payment URL
        this.router.post(
            `${this.path}/vnpay`,
            authMiddleWare(),
            validationMiddleware(CreatePaymentDto),
            this.paymentController.createVnpayPayment
        );

        // GET domain:/api/payment/vnpay-ipn -> Handle VNPAY IPN
        this.router.get(
            `${this.path}/vnpay-ipn`,
            this.paymentController.vnpayIpn
        );

        // GET domain:/api/payment/vnpay-return -> Handle VNPAY Return URL
        this.router.get(
            `${this.path}/vnpay-return`,
            this.paymentController.vnpayReturn
        );
    }
} 