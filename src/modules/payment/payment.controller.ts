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

            // Verify the payment status
            if (orderCode) {
                const result = await this.paymentService.verifyPaymentStatus(orderCode.toString());

                if (result.success && result.payment_status === 'completed') {
                    res.status(HttpStatus.Success).json(
                        formatResponse(result, true, 'Payment completed successfully')
                    );
                    return;
                }
            }

            res.status(HttpStatus.Success).json(
                formatResponse({ status: 'pending' }, true, 'Payment status pending verification')
            );
        } catch (error) {
            next(error);
        }
    };

    public handlePaymentFailure = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderCode } = req.query;

            if (orderCode) {
                // Cancel the payment if it exists
                await this.paymentService.cancelPayment(orderCode.toString());
            }

            res.status(HttpStatus.Success).json(
                formatResponse({ status: 'failed' }, true, 'Payment was cancelled or failed')
            );
        } catch (error) {
            next(error);
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
