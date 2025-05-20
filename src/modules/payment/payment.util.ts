import axios from 'axios';
import crypto from 'crypto';

const PAYOS_API_URL = 'https://api-sandbox.payos.vn/v1/payment-requests'; // Đổi sang production khi live
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || 'YOUR_CLIENT_ID';
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || 'YOUR_API_KEY';
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || 'YOUR_CHECKSUM_KEY';

export async function createPayosPayment(
    amount: number,
    orderCode: string,
    description: string,
    buyerName?: string,
    buyerEmail?: string,
    buyerPhone?: string
): Promise<{ checkoutUrl: string }> {
    const payload = {
        amount,
        orderCode,
        description,
        buyerName,
        buyerEmail,
        buyerPhone,
        cancelUrl: process.env.PAYOS_CANCEL_URL || 'https://yourdomain.com/payment/cancel',
        returnUrl: process.env.PAYOS_RETURN_URL || 'https://yourdomain.com/payment/success',
    };

    // Nếu PayOS yêu cầu checksum, hãy tạo ở đây (tham khảo tài liệu PayOS)
    // const checksum = createChecksum(payload, PAYOS_CHECKSUM_KEY);

    const headers = {
        'x-client-id': PAYOS_CLIENT_ID,
        'x-api-key': PAYOS_API_KEY,
        // 'x-checksum': checksum, // Nếu PayOS yêu cầu
        'Content-Type': 'application/json',
    };

    const response = await axios.post(PAYOS_API_URL, payload, { headers });
    if (response.data && response.data.data && response.data.data.checkoutUrl) {
        return { checkoutUrl: response.data.data.checkoutUrl };
    }
    throw new Error('Cannot create PayOS payment');
}

// Hàm verify webhook (nếu PayOS yêu cầu xác thực signature)
export function verifyPayosWebhook(data: any, receivedSignature: string): boolean {
    // Tùy vào tài liệu PayOS, bạn có thể cần tạo lại signature từ data và so sánh với receivedSignature
    // const expectedSignature = createChecksum(data, PAYOS_CHECKSUM_KEY);
    // return expectedSignature === receivedSignature;
    return true; // Tạm thời luôn đúng, cần sửa theo tài liệu PayOS
}
