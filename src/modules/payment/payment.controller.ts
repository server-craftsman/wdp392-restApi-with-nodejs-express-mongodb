import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import PaymentService from './payment.service';
import { CreatePayosPaymentDto } from './dtos/create-payos-payment.dto';

export default class PaymentController {
    private paymentService = new PaymentService();

    public createPayosPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paymentDto: CreatePayosPaymentDto = req.body;
            const checkoutUrl = await this.paymentService.createPayment(req.user.id, paymentDto);
            res.status(HttpStatus.Success).json(formatResponse<{ checkoutUrl: string }>({ checkoutUrl }));
        } catch (error) {
            next(error);
        }
    };

    public payosWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.paymentService.processPayosWebhook(req.body);
            res.status(HttpStatus.Success).json(result);
        } catch (error) {
            next(error);
        }
    };
}
