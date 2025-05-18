import crypto from 'crypto';
import querystring from 'querystring';
import { vnpayConfig } from '../../core/config/vnpay.config';
import moment from 'moment';

export function createVnpayPaymentUrl(
    amount: number,
    orderInfo: string,
    ipAddr: string,
    orderId: string,
    bankCode: string,
    language: string = 'vn'
): string {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss'); // URL hết hạn sau 15 phút

    let vnpParams: { [key: string]: string | number } = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpayConfig.vnp_TmnCode,
        vnp_Amount: amount * 100, // VNPAY yêu cầu số tiền nhân 100
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: ipAddr,
        vnp_Locale: language || 'vn',
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: '250000', // Mã loại hàng hóa, thay đổi theo nhu cầu
        vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
        vnp_TxnRef: orderId,
        vnp_ExpireDate: expireDate,
    };

    if (bankCode) {
        vnpParams['vnp_BankCode'] = bankCode;
    }

    // Sắp xếp tham số theo thứ tự alphabet
    const sortedParams = sortObject(vnpParams);

    // Tạo chữ ký
    const signData = querystring.stringify(sortedParams, { encode: false } as any);
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sortedParams['vnp_SecureHash'] = signed;

    // Tạo URL thanh toán
    const paramString = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
    const vnpUrl = `${vnpayConfig.vnp_Url}?${paramString}`;
    return vnpUrl;
}

// Hàm sắp xếp object theo key
function sortObject(obj: { [key: string]: any }): { [key: string]: any } {
    const sorted: { [key: string]: any } = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
}

export function verifyVnpayReturn(vnpParams: any): boolean {
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false } as any);
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
}