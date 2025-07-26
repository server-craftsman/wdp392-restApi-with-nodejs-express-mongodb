import axios from 'axios';

// Interface cho OTP details
export interface IOTPDetail {
    phoneNumber: string;
    message: string;
    otp?: string;
}

// Interface cho OTP response
export interface IOTPResponse {
    success: boolean;
    message: string;
    messageId?: string;
}

/**
 * Generate random OTP code
 */
export function generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

/**
 * Create OTP message template for consultation
 */
export function createConsultationOTPTemplate(customerName: string, consultationType: string, otp: string, consultationId: string): string {
    return `
Xin chao ${customerName}!

Cam on ban da dang ky tu van dich vu xet nghiem DNA tai Bloodline DNA Testing Service.

Thong tin dang ky:
- Loai tu van: ${consultationType === 'home' ? 'Tai nha' : 'Tai co so'}
- Ma xac thuc (OTP): ${otp}
- Ma tham chieu: ${consultationId}

Vui long luu giu ma OTP de xac thuc yeu cau tu van.

Cam on ban da tin tuong dich vu cua chung toi!

Bloodline DNA Testing Service
    `.trim();
}

/**
 * Create OTP message template for consultation status update
 */
export function createConsultationStatusOTPTemplate(customerName: string, status: string, consultationId: string, additionalInfo?: string): string {
    let statusText = '';
    switch (status) {
        case 'ASSIGNED':
            statusText = 'Da duoc gan nhan vien tu van';
            break;
        case 'SCHEDULED':
            statusText = 'Da lap lich tu van';
            break;
        case 'COMPLETED':
            statusText = 'Hoan thanh tu van';
            break;
        case 'CANCELLED':
            statusText = 'Da huy tu van';
            break;
        default:
            statusText = `Cap nhat trang thai: ${status}`;
    }

    return `
Xin chao ${customerName}!

Yeu cau tu van cua ban da duoc cap nhat:
- Trang thai: ${statusText}
- Ma tham chieu: ${consultationId}
${additionalInfo ? `- Thong tin them: ${additionalInfo}` : ''}

Cam on ban da su dung dich vu cua chung toi!

Bloodline DNA Testing Service
    `.trim();
}

/**
 * Send OTP via SMS using external service
 * Note: This is a template implementation. You need to integrate with actual SMS service
 * Popular SMS services in Vietnam: VIETGUYS, STRINGEE, ESMS, etc.
 */
export async function sendOTP(otpDetail: IOTPDetail): Promise<IOTPResponse> {
    try {
        // Validate phone number (Vietnam format)
        if (!isValidVietnamesePhoneNumber(otpDetail.phoneNumber)) {
            return {
                success: false,
                message: 'Invalid Vietnamese phone number format',
            };
        }

        // Example implementation with a generic SMS service
        // Replace this with your actual SMS service integration

        // For testing/development, log the OTP instead of sending
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV MODE] SMS to ${otpDetail.phoneNumber}:`);
            console.log(otpDetail.message);
            return {
                success: true,
                message: 'OTP sent successfully (development mode)',
                messageId: `dev_${Date.now()}`,
            };
        }

        // Production SMS service integration example
        // Uncomment and configure with your SMS service
        /*
        const smsResponse = await axios.post(process.env.SMS_API_URL || '', {
            to: otpDetail.phoneNumber,
            message: otpDetail.message,
            apiKey: process.env.SMS_API_KEY
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SMS_API_TOKEN}`
            },
            timeout: 10000
        });

        if (smsResponse.status === 200 && smsResponse.data.success) {
            return {
                success: true,
                message: 'OTP sent successfully',
                messageId: smsResponse.data.messageId
            };
        } else {
            throw new Error(smsResponse.data.message || 'SMS service error');
        }
        */

        // For now, simulate successful sending
        console.log(`[SIMULATION] SMS sent to ${otpDetail.phoneNumber}: ${otpDetail.message}`);
        return {
            success: true,
            message: 'OTP sent successfully (simulation)',
            messageId: `sim_${Date.now()}`,
        };
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        return {
            success: false,
            message: error.message || 'Failed to send OTP',
        };
    }
}

/**
 * Validate Vietnamese phone number format
 */
export function isValidVietnamesePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Vietnamese phone number patterns:
    // Mobile: 09x, 08x, 07x, 05x, 03x (10 digits)
    // With country code: +84 or 84 (starts with 84)
    const mobilePatterns = [
        /^(09|08|07|05|03)\d{8}$/, // 10 digits starting with 09x, 08x, 07x, 05x, 03x
        /^84(9|8|7|5|3)\d{8}$/, // With 84 country code
        /^\+84(9|8|7|5|3)\d{8}$/, // With +84 country code
    ];

    return mobilePatterns.some((pattern) => pattern.test(cleanNumber));
}

/**
 * Format phone number to standard format
 */
export function formatPhoneNumber(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // If starts with 84, keep as is
    if (cleanNumber.startsWith('84')) {
        return `+${cleanNumber}`;
    }

    // If starts with 0, replace with +84
    if (cleanNumber.startsWith('0')) {
        return `+84${cleanNumber.substring(1)}`;
    }

    // If 9 digits, assume missing leading 0
    if (cleanNumber.length === 9) {
        return `+840${cleanNumber}`;
    }

    return `+84${cleanNumber}`;
}

/**
 * Store OTP for verification (in-memory for demo, use Redis/DB in production)
 */
const otpStore = new Map<string, { otp: string; expires: number; phoneNumber: string }>();

/**
 * Store OTP for verification
 */
export function storeOTP(phoneNumber: string, otp: string, expirationMinutes: number = 5): void {
    const expires = Date.now() + expirationMinutes * 60 * 1000;
    const key = `otp_${phoneNumber}_${Date.now()}`;

    // Clean expired OTPs
    cleanExpiredOTPs();

    otpStore.set(key, {
        otp,
        expires,
        phoneNumber: formatPhoneNumber(phoneNumber),
    });

    console.log(`OTP stored for ${phoneNumber}, expires in ${expirationMinutes} minutes`);
}

/**
 * Verify OTP
 */
export function verifyOTP(phoneNumber: string, inputOTP: string): boolean {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Clean expired OTPs
    cleanExpiredOTPs();

    // Find matching OTP
    for (const [key, otpData] of otpStore.entries()) {
        if (otpData.phoneNumber === formattedPhone && otpData.otp === inputOTP) {
            // Remove used OTP
            otpStore.delete(key);
            return true;
        }
    }

    return false;
}

/**
 * Clean expired OTPs from store
 */
function cleanExpiredOTPs(): void {
    const now = Date.now();
    for (const [key, otpData] of otpStore.entries()) {
        if (otpData.expires < now) {
            otpStore.delete(key);
        }
    }
}

/**
 * Get OTP statistics for monitoring
 */
export function getOTPStats(): { total: number; active: number } {
    cleanExpiredOTPs();
    return {
        total: otpStore.size,
        active: otpStore.size,
    };
}
