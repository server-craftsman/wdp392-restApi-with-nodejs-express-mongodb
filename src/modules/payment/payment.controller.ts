import { NextFunction, Request, Response, Router } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import PaymentService from './payment.service';
import { CreatePayosPaymentDto } from './dtos/createPayosPayment.dto';
import { CreateSamplePaymentDto } from './dtos/createSamplePayment.dto';
import { CreateAppointmentPaymentDto } from './dtos/createAppointmentPayment.dto';
import { PaymentStatusEnum } from './payment.enum';

export default class PaymentController {
    private paymentService = new PaymentService();

    // Xử lý webhook từ PayOS khi có thay đổi trạng thái thanh toán
    public handlePayosWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('PayOS Webhook received:', {
                headers: req.headers,
                body: req.body,
                method: req.method,
                url: req.url,
            });

            // Validate webhook data
            if (!req.body) {
                console.error('PayOS Webhook: Empty request body');
                return res.status(HttpStatus.BadRequest).json(formatResponse(false, false, 'Empty webhook data'));
            }

            const webhookData = req.body;

            // Process webhook
            const result = await this.paymentService.processPayosWebhook(webhookData);

            // PayOS expects a 200 response for successful webhook processing
            const statusCode = result.success ? HttpStatus.Success : HttpStatus.BadRequest;

            res.status(statusCode).json(formatResponse(result, result.success, result.message));
        } catch (error: any) {
            console.error('PayOS Webhook handler error:', error);

            // Always return 200 to PayOS to prevent retries for server errors
            // but log the actual error for debugging
            res.status(HttpStatus.Success).json(formatResponse(false, false, 'Webhook processing failed'));
        }
    };

    // Tạo chữ ký webhook test cho development
    public generateTestWebhookSignature = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (process.env.NODE_ENV === 'production') {
                return res.status(HttpStatus.Forbidden).json(formatResponse(false, false, 'Test endpoint not available in production'));
            }

            const testData = req.body;
            if (!testData) {
                return res.status(HttpStatus.BadRequest).json(formatResponse(false, false, 'No test data provided'));
            }

            // Import the signature generation function
            const { generatePayosSignature } = await import('./payment.util');
            const signature = generatePayosSignature(testData);

            res.status(HttpStatus.Success).json(
                formatResponse(
                    {
                        signature,
                        data: testData,
                        signedData: { ...testData, signature },
                    },
                    true,
                    'Test signature generated successfully',
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    // Xử lý return URL từ PayOS sau khi thanh toán
    public handlePayosReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { orderCode, code, id, cancel, status } = req.query;
            console.log('PayOS return handler called with:', { orderCode, code, id, cancel, status });

            if (!orderCode) {
                console.error('Missing orderCode in PayOS return');
                const frontendUrl = process.env.DOMAIN_FE || '/';
                const params = new URLSearchParams([
                    ['code', '99'],
                    ['status', 'error'],
                    ['message', 'Missing order code'],
                ]);
                res.redirect(`${frontendUrl.replace(/\/$/, '')}/payos?${params.toString()}`);
                return;
            }

            // Find the payment by orderCode
            const payment = await this.paymentService.findPaymentByOrderCode(Number(orderCode));
            if (!payment) {
                console.error(`Payment not found for orderCode: ${orderCode}`);
                const frontendUrl = process.env.DOMAIN_FE || '/';
                const params = new URLSearchParams([
                    ['code', '99'],
                    ['orderCode', orderCode.toString()],
                    ['status', 'error'],
                    ['message', 'Payment not found'],
                ]);
                res.redirect(`${frontendUrl.replace(/\/$/, '')}/payos?${params.toString()}`);
                return;
            }

            // Check if this is a cancellation
            if (cancel === 'true' || code === '99') {
                console.log(`Payment cancelled for orderCode: ${orderCode}`);
                try {
                    await this.paymentService.cancelPayment(orderCode.toString());
                } catch (cancelError) {
                    console.error('Error cancelling payment:', cancelError);
                }

                const frontendUrl = process.env.DOMAIN_FE || '/';
                const params = new URLSearchParams([
                    ['code', '99'],
                    ['orderCode', orderCode.toString()],
                    ['status', 'cancelled'],
                    ['paymentNo', payment.payment_no || ''],
                    ['appointmentId', payment.appointment_id || ''],
                ]);
                res.redirect(`${frontendUrl.replace(/\/$/, '')}/payos?${params.toString()}`);
                return;
            }

            // Verify payment status with PayOS API
            const result = await this.paymentService.verifyPaymentStatus(orderCode.toString());
            console.log(`Payment verification result:`, result);

            // Prepare redirect parameters
            const frontendUrl = process.env.DOMAIN_FE || '/';
            const params = new URLSearchParams([
                ['code', result.payment_status === PaymentStatusEnum.COMPLETED ? '00' : '01'],
                ['id', payment.payos_web_id || id?.toString() || ''],
                ['orderCode', orderCode.toString()],
                ['status', result.payment_status],
                ['paymentNo', payment.payment_no || ''],
                ['appointmentId', payment.appointment_id || ''],
                ['payosStatus', result.payos_status || ''],
                ['verifiedAt', new Date().toISOString()],
            ]);

            console.log(`Redirecting to frontend with params:`, params.toString());
            res.redirect(`${frontendUrl.replace(/\/$/, '')}/payos?${params.toString()}`);
            return;
        } catch (error) {
            console.error('Error in handlePayosReturn:', error);
            const frontendUrl = process.env.DOMAIN_FE || '/';
            const params = new URLSearchParams([
                ['code', '99'],
                ['status', 'error'],
                ['message', 'Internal server error'],
            ]);
            res.redirect(`${frontendUrl.replace(/\/$/, '')}/payos?${params.toString()}`);
        }
    };

    // Xử lý cancel URL từ PayOS khi hủy thanh toán
    public handlePayosCancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { orderCode } = req.query;
            console.log('PayOS cancel handler called with:', { orderCode });

            if (orderCode) {
                // Cancel the payment if it exists
                await this.paymentService.cancelPayment(orderCode.toString());
            }

            // Redirect to frontend with cancel status
            const frontendUrl = process.env.DOMAIN_FE || '/';
            const params = new URLSearchParams([
                ['code', '99'],
                ['orderCode', orderCode?.toString() || ''],
                ['status', 'cancelled'],
            ]);
            res.redirect(`${frontendUrl.replace(/\/$/, '')}/payos?${params.toString()}`);
            return;
        } catch (error) {
            console.error('Error in handlePayosCancel:', error);
            const frontendUrl = process.env.DOMAIN_FE || '/';
            const params = new URLSearchParams([
                ['code', '99'],
                ['status', 'error'],
            ]);
            res.redirect(`${frontendUrl.replace(/\/$/, '')}/payos?${params.toString()}`);
        }
    };

    // Tạo thanh toán cho lịch hẹn xét nghiệm DNA
    public createAppointmentPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                res.status(HttpStatus.Unauthorized).json(formatResponse(false, true, 'User not authenticated'));
                return;
            }

            const paymentData: CreateAppointmentPaymentDto = req.body;
            const userRole = req.user.role;

            // If sample_ids is not provided, it will be handled in the service
            // by automatically fetching all samples for the appointment

            const result = await this.paymentService.createAppointmentPayment(userId, paymentData, userRole);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Appointment payment created successfully'));
        } catch (error) {
            next(error);
        }
    };

    // Xác minh trạng thái thanh toán với PayOS
    public verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { paymentNo } = req.params;
            const result = await this.paymentService.verifyPaymentStatus(paymentNo);

            res.status(HttpStatus.Success).json(formatResponse(result, true, 'Payment verification completed'));
        } catch (error) {
            next(error);
        }
    };

    // Hủy thanh toán đang ở trạng thái pending
    public cancelPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { paymentNo } = req.params;
            const result = await this.paymentService.cancelPayment(paymentNo);

            res.status(HttpStatus.Success).json(formatResponse(result, true, result.message));
        } catch (error) {
            next(error);
        }
    };

    // Xử lý callback thành công từ PayOS
    public handlePaymentSuccess = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderCode, amount, status } = req.query;
            console.log('Payment success handler called with:', { orderCode, amount, status });

            if (!orderCode) {
                console.error('Missing orderCode in payment success callback');
                return res.redirect(process.env.FRONTEND_PAYMENT_FAILED_URL || '/payments/failed');
            }

            // Verify the payment status
            const result = await this.paymentService.verifyPaymentStatus(orderCode.toString());

            if (result.payment_status === 'completed') {
                console.log(`Payment ${orderCode} verified as completed`);

                // Get frontend success URL from environment or use default
                const successUrl = process.env.FRONTEND_PAYMENT_SUCCESS_URL || '/payments/success';

                // Add payment info to URL if needed
                const redirectUrl = `${successUrl}?orderCode=${orderCode}&status=success`;

                // Redirect to frontend success page
                return res.redirect(redirectUrl);
            } else {
                console.log(`Payment ${orderCode} verification failed or payment not completed`);

                // If payment verification failed, check if we should retry
                if (result.payment_status === 'pending') {
                    // Payment is still pending, we can show a processing page
                    const pendingUrl = process.env.FRONTEND_PAYMENT_PENDING_URL || '/payments/pending';
                    return res.redirect(`${pendingUrl}?orderCode=${orderCode}`);
                } else {
                    // Payment failed or was cancelled
                    const failedUrl = process.env.FRONTEND_PAYMENT_FAILED_URL || '/payments/failed';
                    return res.redirect(`${failedUrl}?orderCode=${orderCode}&status=${result.payment_status}`);
                }
            }
        } catch (error) {
            console.error('Error in handlePaymentSuccess:', error);
            const failedUrl = process.env.FRONTEND_PAYMENT_FAILED_URL || '/payments/failed';
            return res.redirect(`${failedUrl}?error=internal`);
        }
    };

    // Xử lý callback thất bại từ PayOS
    public handlePaymentFailure = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderCode } = req.query;
            console.log('Payment failure handler called with:', { orderCode });

            if (orderCode) {
                // Cancel the payment if it exists
                await this.paymentService.cancelPayment(orderCode.toString());
            }

            // Redirect to frontend failed page
            const failedUrl = process.env.FRONTEND_PAYMENT_FAILED_URL || '/payments/failed';
            return res.redirect(`${failedUrl}?orderCode=${orderCode || 'unknown'}&status=cancelled`);
        } catch (error) {
            console.error('Error in handlePaymentFailure:', error);
            const failedUrl = process.env.FRONTEND_PAYMENT_FAILED_URL || '/payments/failed';
            return res.redirect(`${failedUrl}?error=internal`);
        }
    };

    // Lấy danh sách mẫu xét nghiệm của thanh toán
    public getPaymentSamples = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { paymentId } = req.params;
            const samples = await this.paymentService.getPaymentSamples(paymentId);

            res.status(HttpStatus.Success).json(formatResponse(samples, true, 'Samples retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    // Get detailed payment status for frontend verification
    public getPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderCode } = req.params;

            if (!orderCode) {
                return res.status(HttpStatus.BadRequest).json(formatResponse(false, false, 'Order code is required'));
            }

            // Find payment by orderCode
            const payment = await this.paymentService.findPaymentByOrderCode(Number(orderCode));
            if (!payment) {
                return res.status(HttpStatus.NotFound).json(formatResponse(false, false, 'Payment not found'));
            }

            // Verify current status with PayOS
            const verificationResult = await this.paymentService.verifyPaymentStatus(orderCode);

            // Get appointment details if available
            let appointmentDetails = null;
            if (payment.appointment_id) {
                try {
                    // You might want to import and use AppointmentService here
                    // For now, we'll just include the appointment_id
                    appointmentDetails = {
                        appointment_id: payment.appointment_id,
                        // Add more appointment details as needed
                    };
                } catch (error) {
                    console.error('Error fetching appointment details:', error);
                }
            }

            const responseData = {
                payment: {
                    payment_no: payment.payment_no,
                    amount: payment.amount,
                    payment_method: payment.payment_method,
                    status: payment.status,
                    payos_order_code: payment.payos_order_code,
                    payos_web_id: payment.payos_web_id,
                    payos_payment_url: payment.payos_payment_url,
                    created_at: payment.created_at,
                    updated_at: payment.updated_at,
                },
                verification: verificationResult,
                appointment: appointmentDetails,
                timestamp: new Date().toISOString(),
            };

            res.status(HttpStatus.Success).json(formatResponse(responseData, true, 'Payment status retrieved successfully'));
        } catch (error) {
            next(error);
        }
    };

    // Lấy lịch sử giao dịch của một thanh toán
    public getPaymentTransactions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { paymentId } = req.params;

            if (!paymentId) {
                return res.status(HttpStatus.BadRequest).json(formatResponse(null, false, 'Payment ID is required'));
            }

            const transactions = await this.paymentService.getPaymentTransactions(paymentId);

            res.status(HttpStatus.Success).json(formatResponse(transactions, true, 'Payment transactions retrieved successfully'));
        } catch (error: any) {
            console.error('Get payment transactions error:', error);
            res.status(HttpStatus.InternalServerError).json(formatResponse(null, false, error.message || 'Error retrieving payment transactions'));
        }
    };

    // Lấy lịch sử giao dịch của một lịch hẹn
    public getAppointmentTransactions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { appointmentId } = req.params;

            if (!appointmentId) {
                return res.status(HttpStatus.BadRequest).json(formatResponse(null, false, 'Appointment ID is required'));
            }

            const transactions = await this.paymentService.getAppointmentTransactions(appointmentId);

            res.status(HttpStatus.Success).json(formatResponse(transactions, true, 'Appointment transactions retrieved successfully'));
        } catch (error: any) {
            console.error('Get appointment transactions error:', error);
            res.status(HttpStatus.InternalServerError).json(formatResponse(null, false, error.message || 'Error retrieving appointment transactions'));
        }
    };

    // Test transaction creation (development only)
    public testTransactionCreation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Only allow in development environment
            if (process.env.NODE_ENV === 'production') {
                return res.status(HttpStatus.Forbidden).json(formatResponse(null, false, 'Test endpoint not available in production'));
            }

            const result = await this.paymentService.testTransactionCreation();

            res.status(HttpStatus.Success).json(formatResponse(result, result.success, result.message));
        } catch (error: any) {
            console.error('Test transaction creation error:', error);
            res.status(HttpStatus.InternalServerError).json(formatResponse(null, false, error.message || 'Error testing transaction creation'));
        }
    };
}
