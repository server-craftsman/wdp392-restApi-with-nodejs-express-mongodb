import { Router } from 'express';
import { IRoute } from '../../core/interfaces';
import PaymentController from './payment.controller';
import { authMiddleWare, validationMiddleware } from '../../core/middleware';
import { CreatePayosPaymentDto } from './dtos/createPayosPayment.dto';
import { CreateSamplePaymentDto } from './dtos/createSamplePayment.dto';
import { API_PATH } from '../../core/constants';
import { UserRoleEnum } from '../user/user.enum';
import { CreateAppointmentPaymentDto } from './dtos/createAppointmentPayment.dto';

export default class PaymentRoute implements IRoute {
    public path = API_PATH.PAYMENT;
    public router = Router();
    private paymentController = new PaymentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // POST: domain:/api/payment/webhook -> Handle PayOS webhook
        this.router.post(
            `${this.path}/webhook`,
            this.paymentController.handlePayosWebhook
        );

        // POST: domain:/api/payment/appointment -> Create a payment for an appointment with selected payment method
        this.router.post(
            `${this.path}/appointment`,
            authMiddleWare([UserRoleEnum.CUSTOMER]),
            validationMiddleware(CreateAppointmentPaymentDto),
            this.paymentController.createAppointmentPayment
        );

        // GET: domain:/api/payment/verify/:paymentNo -> Verify payment status
        this.router.get(
            `${this.path}/verify/:paymentNo`,
            authMiddleWare(),
            this.paymentController.verifyPayment
        );

        // POST: domain:/api/payment/cancel/:paymentNo -> Cancel payment
        this.router.post(
            `${this.path}/cancel/:paymentNo`,
            authMiddleWare(),
            this.paymentController.cancelPayment
        );

        // GET: domain:/api/payment/success -> Handle successful payment redirect
        this.router.get(
            `${this.path}/success`,
            this.paymentController.handlePaymentSuccess
        );

        // GET: domain:/api/payment/failed -> Handle failed payment redirect
        this.router.get(
            `${this.path}/failed`,
            this.paymentController.handlePaymentFailure
        );

        // GET: domain:/api/payment/:paymentId/samples -> Get samples for a payment
        this.router.get(
            `${this.path}/:paymentId/samples`,
            authMiddleWare(),
            this.paymentController.getPaymentSamples
        );
    }
}
