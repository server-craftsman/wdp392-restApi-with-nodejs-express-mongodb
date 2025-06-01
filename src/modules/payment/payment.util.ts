import PayOS from '@payos/node';
import dotenv from 'dotenv';

dotenv.config();

// PayOS credentials
const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

// Validate credentials
if (!clientId || !apiKey || !checksumKey) {
    throw new Error('Missing PayOS configuration: CLIENT_ID, API_KEY, or CHECKSUM_KEY');
}

// Initialize PayOS client
const payosClient = new PayOS(clientId, apiKey, checksumKey);

/**
 * Create a payment link using PayOS
 */
export async function createPayosPayment(
    amount: number,
    orderCode?: string,
    description?: string,
    buyerName?: string,
    buyerEmail?: string,
    buyerPhone?: string
    
): Promise<{ checkoutUrl: string }> {
    try {
        // Validate input
        if (!amount || amount < 1000) {
            throw new Error('Amount must be a positive integer >= 1000 VND');
        }
        if (!orderCode) {
            throw new Error('Order code is required');
        }
        if (!description) {
            throw new Error('Description is required');
        }
        // Giới hạn description tối đa 25 ký tự
        const trimmedDescription = description.length > 25 ? description.substring(0, 25) : description;
        if (description.length > 25) {
            console.warn(`Description truncated to 25 characters: ${trimmedDescription}`);
        }

        // Convert order code to number
        const numericOrderCode = parseInt(orderCode.replace(/\D/g, ''), 10) || Math.floor(Date.now() / 1000);

        // Create payment data
        const paymentData = {
            amount: Math.floor(amount),
            orderCode: numericOrderCode,
            description: trimmedDescription,
            ...(buyerName && { buyerName }),
            ...(buyerEmail && { buyerEmail }),
            ...(buyerPhone && { buyerPhone }),
            cancelUrl: process.env.PAYOS_CANCEL_URL || 'http://localhost:8080/api/payment/payos-cancel',
            returnUrl: process.env.PAYOS_RETURN_URL || 'http://localhost:8080/api/payment/payos-return',
            items: [
                {
                    name: trimmedDescription,
                    quantity: 1,
                    price: Math.floor(amount),
                },
            ],
        };

        console.log('PayOS Request:', paymentData);

        // Get payment link
        const response = await payosClient.createPaymentLink(paymentData);

        console.log('PayOS Response:', response);

        if (response && response.checkoutUrl) {
            return { checkoutUrl: response.checkoutUrl };
        }

        throw new Error('Invalid PayOS response: Missing checkoutUrl');
    } catch (error: any) {
        console.error('PayOS Error:', {
            message: error.message,
            response: error.response?.data,
            code: error.code,
        });
        throw new Error(`Failed to create payment link: ${error.message}`);
    }
}

/**
 * Verify webhook signature
 */
export function verifyPayosWebhook(data: any, receivedSignature: string): boolean {
    // Implement actual signature verification
    console.warn('Webhook verification is not implemented');
    return true;
}