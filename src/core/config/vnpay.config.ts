export const vnpayConfig = {
    vnp_TmnCode: (process.env.VNPAY_TMN_CODE || '5JBSWMIJ').trim(),
    vnp_HashSecret: (process.env.VNPAY_HASH_SECRET || '82JGPVEAZP6VE80AH675BBLJ4OIE4OEB').trim(),
    vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/payment/vnpay-return',
    vnp_ApiUrl: process.env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    vnp_Version: '2.1.0',
    vnp_Locale: 'vn',
    vnp_Command: 'pay',
    vnp_CurrCode: 'VND',
}; 