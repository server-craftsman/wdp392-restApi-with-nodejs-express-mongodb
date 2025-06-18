import PayOS from '@payos/node';
import dotenv from 'dotenv';
import crypto from 'crypto';

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
): Promise<{ checkoutUrl: string, orderCode: number }> {
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

        if (response && response.checkoutUrl && response.orderCode) {
            return { checkoutUrl: response.checkoutUrl, orderCode: response.orderCode };
        }

        throw new Error('Invalid PayOS response: Missing checkoutUrl or orderCode');
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
    try {
        // For debugging purposes - log the received data and signature
        console.log('Webhook verification - Received data:', JSON.stringify(data));
        console.log('Webhook verification - Received signature:', receivedSignature);

        if (!checksumKey || !receivedSignature) {
            console.error('Missing checksum key or signature');
            return false;
        }

        // For testing/debugging purposes - allow a specific test signature
        // REMOVE THIS IN PRODUCTION
        if (process.env.NODE_ENV !== 'production' && receivedSignature === 'test_signature_for_debugging') {
            console.warn('WARNING: Accepting test signature - DO NOT USE IN PRODUCTION');
            return true;
        }

        // Create a copy of data without the signature field
        const { signature, ...dataWithoutSignature } = data;

        // Sort keys alphabetically
        const sortedData = Object.keys(dataWithoutSignature)
            .sort()
            .reduce((obj: any, key: string) => {
                obj[key] = dataWithoutSignature[key];
                return obj;
            }, {});

        // Convert to JSON string
        const jsonString = JSON.stringify(sortedData);
        console.log('Webhook verification - Data for signature calculation:', jsonString);

        // Create HMAC signature using SHA256
        const hmac = crypto.createHmac('sha256', checksumKey);
        hmac.update(jsonString);
        const calculatedSignature = hmac.digest('hex');
        console.log('Webhook verification - Calculated signature:', calculatedSignature);

        // Compare signatures
        const isValid = calculatedSignature === receivedSignature;

        if (!isValid) {
            console.error('Signature verification failed', {
                received: receivedSignature,
                calculated: calculatedSignature,
                data: jsonString
            });
        } else {
            console.log('Signature verification successful');
        }

        return isValid;
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

/**
 * Generate a test signature for webhook data
 * This is for testing purposes only
 */
export function generateTestSignature(data: any): string {
    try {
        if (!checksumKey) {
            console.error('Missing checksum key');
            return '';
        }

        // Remove any existing signature field
        const { signature, ...dataWithoutSignature } = data;

        // Sort keys alphabetically
        const sortedData = Object.keys(dataWithoutSignature)
            .sort()
            .reduce((obj: any, key: string) => {
                obj[key] = dataWithoutSignature[key];
                return obj;
            }, {});

        // Convert to JSON string
        const jsonString = JSON.stringify(sortedData);
        console.log('Test signature - Data for signature calculation:', jsonString);

        // Create HMAC signature using SHA256
        const hmac = crypto.createHmac('sha256', checksumKey);
        hmac.update(jsonString);
        const calculatedSignature = hmac.digest('hex');
        console.log('Test signature generated:', calculatedSignature);

        return calculatedSignature;
    } catch (error) {
        console.error('Error generating test signature:', error);
        return '';
    }
}