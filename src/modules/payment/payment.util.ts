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
            cancelUrl: process.env.PAYOS_CANCEL_URL || '',
            returnUrl: process.env.PAYOS_RETURN_URL || '',
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
 * Verify webhook signature - Fixed and simplified version
 */
export function verifyPayosWebhook(data: any, receivedSignature: string): boolean {
    try {
        // Validate inputs
        if (!checksumKey) {
            console.error('PayOS webhook verification: Missing checksum key');
            return false;
        }

        if (!receivedSignature) {
            console.error('PayOS webhook verification: Missing signature');
            return false;
        }

        // Create a copy of data without the signature field
        const { signature, ...dataWithoutSignature } = data;

        // Sort keys alphabetically and create consistent string representation
        const sortedKeys = Object.keys(dataWithoutSignature).sort();
        const sortedData: any = {};

        for (const key of sortedKeys) {
            sortedData[key] = dataWithoutSignature[key];
        }

        // Convert to JSON string for signature calculation
        const jsonString = JSON.stringify(sortedData);

        // Create HMAC signature using SHA256
        const hmac = crypto.createHmac('sha256', checksumKey);
        hmac.update(jsonString);
        const calculatedSignature = hmac.digest('hex');

        // If lengths differ, signature is definitely invalid – avoid timingSafeEqual error
        if (calculatedSignature.length !== receivedSignature.length) {
            console.error('PayOS webhook verification failed: Signature length mismatch');
            return false;
        }

        // Compare signatures using secure comparison
        let isValid = false;
        try {
            isValid = crypto.timingSafeEqual(
                Buffer.from(calculatedSignature, 'hex'),
                Buffer.from(receivedSignature, 'hex')
            );
        } catch (cmpErr: any) {
            console.error('PayOS webhook verification error during comparison:', cmpErr.message);
            return false;
        }

        if (!isValid) {
            console.error('PayOS webhook verification failed: Signature mismatch');
            console.error('Data used for verification:', jsonString);
        } else {
            console.log('PayOS webhook signature verified successfully');
        }

        return isValid;

    } catch (error: any) {
        console.error('PayOS webhook verification error:', error.message);
        return false;
    }
}

/**
 * Generate signature for testing purposes
 */
export function generatePayosSignature(data: any): string {
    try {
        if (!checksumKey) {
            console.error('Missing checksum key for signature generation');
            return '';
        }

        // Remove any existing signature field
        const { signature: _, ...dataWithoutSignature } = data;

        // Sort keys alphabetically
        const sortedKeys = Object.keys(dataWithoutSignature).sort();
        const sortedData: any = {};

        for (const key of sortedKeys) {
            sortedData[key] = dataWithoutSignature[key];
        }

        // Convert to JSON string
        const jsonString = JSON.stringify(sortedData);

        // Create HMAC signature using SHA256
        const hmac = crypto.createHmac('sha256', checksumKey);
        hmac.update(jsonString);
        const generatedSignature = hmac.digest('hex');

        console.log('Generated PayOS signature for data:', jsonString);
        return generatedSignature;

    } catch (error: any) {
        console.error('Error generating PayOS signature:', error.message);
        return '';
    }
}

// Remove the old generateTestSignature function and replace with the new one
export { generatePayosSignature as generateTestSignature };