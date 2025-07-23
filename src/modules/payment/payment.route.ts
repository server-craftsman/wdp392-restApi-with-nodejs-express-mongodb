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

        // POST: domain:/api/payments/webhook -> Handle PayOS webhook
        this.router.post(
            `${this.path}/webhook/payos`,
            this.paymentController.handlePayosWebhook as any
        );

        // GET: domain:/api/payments/payos-return -> Handle PayOS return
        this.router.get(
            `${this.path}/payos-return`,
            this.paymentController.handlePayosReturn.bind(this.paymentController)
        );

        // GET: domain:/api/payments/payos-cancel -> Handle PayOS cancel
        this.router.get(
            `${this.path}/payos-cancel`,
            this.paymentController.handlePayosCancel.bind(this.paymentController)
        );

        // POST: domain:/api/payments/appointment -> Create a payment for an appointment with selected payment method
        this.router.post(
            `${this.path}/appointment`,
            authMiddleWare(),
            validationMiddleware(CreateAppointmentPaymentDto),
            this.paymentController.createAppointmentPayment
        );

        // GET: domain:/api/payments/verify/:paymentNo -> Verify payment status
        this.router.get(
            `${this.path}/:paymentNo/verify`,
            authMiddleWare(),
            this.paymentController.verifyPayment
        );

        // GET: domain:/api/payments/status/:orderCode -> Get detailed payment status for frontend
        this.router.get(
            `${this.path}/status/:orderCode`,
            this.paymentController.getPaymentStatus as any
        );

        // POST: domain:/api/payments/cancel/:paymentNo -> Cancel payment
        this.router.post(
            `${this.path}/:paymentNo/cancel`,
            authMiddleWare(),
            this.paymentController.cancelPayment
        );

        // GET: domain:/api/payments/success -> Handle successful payment redirect
        this.router.get(
            `${this.path}/success`,
            this.paymentController.handlePaymentSuccess
        );

        // GET: domain:/api/payments/failed -> Handle failed payment redirect
        this.router.get(
            `${this.path}/failed`,
            this.paymentController.handlePaymentFailure
        );

        // GET: domain:/api/payments/:paymentId/samples -> Get samples for a payment
        this.router.get(
            `${this.path}/:paymentId/samples`,
            authMiddleWare(),
            this.paymentController.getPaymentSamples
        );

        // GET: domain:/api/payments/:paymentId/transactions -> Get transaction history for a payment
        this.router.get(
            `${this.path}/:paymentId/transactions`,
            authMiddleWare(),
            this.paymentController.getPaymentTransactions as any
        );

        // GET: domain:/api/payments/appointment/:appointmentId/transactions -> Get transaction history for appointment
        this.router.get(
            `${this.path}/appointment/:appointmentId/transactions`,
            authMiddleWare(),
            this.paymentController.getAppointmentTransactions as any
        );

        // POST: domain:/api/payments/test-webhook-signature -> Generate test webhook signature (dev only)
        this.router.post(
            `${this.path}/test-webhook-signature`,
            this.paymentController.generateTestWebhookSignature as any
        );

        // GET: domain:/api/payments/test-transaction-creation -> Test transaction creation (dev only)
        this.router.get(
            `${this.path}/test-transaction-creation`,
            this.paymentController.testTransactionCreation as any
        );
    }
}
