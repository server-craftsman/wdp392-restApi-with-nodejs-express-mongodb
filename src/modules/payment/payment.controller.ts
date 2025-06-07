import { NextFunction, Request, Response, Router } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import PaymentService from './payment.service';
import { CreatePayosPaymentDto } from './dtos/createPayosPayment.dto';
import { CreateSamplePaymentDto } from './dtos/createSamplePayment.dto';
import { CreateAppointmentPaymentDto } from './dtos/createAppointmentPayment.dto';

export default class PaymentController {
    private paymentService = new PaymentService();

    public handlePayosWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const webhookData = req.body;
            const result = await this.paymentService.processPayosWebhook(webhookData);

            res.status(HttpStatus.Success).json(
                formatResponse(result.success, true, result.message)
            );
        } catch (error) {
            next(error);
        }
    };

    public createAppointmentPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                res.status(HttpStatus.Unauthorized).json(
                    formatResponse(false, true, 'User not authenticated')
                );
                return;
            }

            const paymentData: CreateAppointmentPaymentDto = req.body;

            // If sample_ids is not provided, it will be handled in the service
            // by automatically fetching all samples for the appointment

            const result = await this.paymentService.createAppointmentPayment(userId, paymentData);

            res.status(HttpStatus.Success).json(
                formatResponse(result, true, 'Appointment payment created successfully')
            );
        } catch (error) {
            next(error);
        }
    };

    public verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { paymentNo } = req.params;
            const result = await this.paymentService.verifyPaymentStatus(paymentNo);

            res.status(HttpStatus.Success).json(
                formatResponse(result, true, 'Payment verification completed')
            );
        } catch (error) {
            next(error);
        }
    };

    public cancelPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { paymentNo } = req.params;
            const result = await this.paymentService.cancelPayment(paymentNo);

            res.status(HttpStatus.Success).json(
                formatResponse(result, true, result.message)
            );
        } catch (error) {
            next(error);
        }
    };

    public handlePaymentSuccess = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderCode, amount, status } = req.query;
            console.log('Payment success handler called with:', { orderCode, amount, status });

            if (!orderCode) {
                console.error('Missing orderCode in payment success callback');
                return res.redirect(process.env.FRONTEND_PAYMENT_FAILED_URL || '/payment/failed');
            }

            // Verify the payment status
            const result = await this.paymentService.verifyPaymentStatus(orderCode.toString());

            if (result.success && result.payment_status === 'completed') {
                console.log(`Payment ${orderCode} verified as completed`);

                // Get frontend success URL from environment or use default
                const successUrl = process.env.FRONTEND_PAYMENT_SUCCESS_URL || '/payment/success';

                // Add payment info to URL if needed
                const redirectUrl = `${successUrl}?orderCode=${orderCode}&status=success`;

                // Redirect to frontend success page
                return res.redirect(redirectUrl);
            } else {
                console.log(`Payment ${orderCode} verification failed or payment not completed`);

                // If payment verification failed, check if we should retry
                if (result.payment_status === 'pending') {
                    // Payment is still pending, we can show a processing page
                    const pendingUrl = process.env.FRONTEND_PAYMENT_PENDING_URL || '/payment/pending';
                    return res.redirect(`${pendingUrl}?orderCode=${orderCode}`);
                } else {
                    // Payment failed or was cancelled
                    const failedUrl = process.env.FRONTEND_PAYMENT_FAILED_URL || '/payment/failed';
                    return res.redirect(`${failedUrl}?orderCode=${orderCode}&status=${result.payment_status}`);
                }
            }
        } catch (error) {
            console.error('Error in handlePaymentSuccess:', error);
            const failedUrl = process.env.FRONTEND_PAYMENT_FAILED_URL || '/payment/failed';
            return res.redirect(`${failedUrl}?error=internal`);
        }
    };

    public handlePaymentFailure = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderCode } = req.query;
            console.log('Payment failure handler called with:', { orderCode });

            if (orderCode) {
                // Cancel the payment if it exists
                await this.paymentService.cancelPayment(orderCode.toString());
            }

            // Redirect to frontend failed page
            const failedUrl = process.env.FRONTEND_PAYMENT_FAILED_URL || '/payment/failed';
            return res.redirect(`${failedUrl}?orderCode=${orderCode || 'unknown'}&status=cancelled`);
        } catch (error) {
            console.error('Error in handlePaymentFailure:', error);
            const failedUrl = process.env.FRONTEND_PAYMENT_FAILED_URL || '/payment/failed';
            return res.redirect(`${failedUrl}?error=internal`);
        }
    };

    /**
     * Get samples for a payment
     */
    public getPaymentSamples = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { paymentId } = req.params;
            const samples = await this.paymentService.getPaymentSamples(paymentId);

            res.status(HttpStatus.Success).json(
                formatResponse(samples, true, 'Samples retrieved successfully')
            );
        } catch (error) {
            next(error);
        }
    };
}
