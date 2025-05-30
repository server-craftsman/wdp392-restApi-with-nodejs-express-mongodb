import nodemailer from 'nodemailer';
import { ISendMailDetail } from '../interfaces';

/**
 * Tạo HTML template cho email xác nhận đăng ký
 * @param userName Tên người dùng
 * @param verificationLink Link xác nhận
 * @returns HTML string
 */
export const createVerificationEmailTemplate = (userName: string, verificationLink: string): string => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #eee;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
            }
            .content {
                padding: 20px 0;
            }
            .verification-button {
                display: inline-block;
                background-color: #3498db;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 4px;
                margin: 20px 0;
                font-weight: bold;
            }
            .verification-link {
                margin: 15px 0;
                word-break: break-all;
                color: #3498db;
            }
            .footer {
                text-align: center;
                color: #7f8c8d;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Bloodline DNA Testing Service</div>
            </div>
            <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Hello, <strong>${userName}</strong>!</p>
                <p>Thank you for registering with Bloodline DNA Testing Service. To complete your registration and access our services, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationLink}" class="verification-button">Verify Email</a>
                </div>
                
                <p>If the button above doesn't work, please copy and paste the following link into your browser:</p>
                <div class="verification-link">
                    <a href="${verificationLink}">${verificationLink}</a>
                </div>
                
                <p>This verification link will expire in 24 hours.</p>
                
                <p>If you did not create an account with us, please disregard this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Bloodline DNA Testing Service. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Tạo HTML template cho email quên mật khẩu
 * @param userName Tên người dùng
 * @param resetLink Link đặt lại mật khẩu
 * @returns HTML string
 */
export const createPasswordResetEmailTemplate = (userName: string, resetLink: string): string => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #eee;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
            }
            .content {
                padding: 20px 0;
            }
            .reset-button {
                display: inline-block;
                background-color: #e74c3c;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 4px;
                margin: 20px 0;
                font-weight: bold;
            }
            .reset-link {
                margin: 15px 0;
                word-break: break-all;
                color: #e74c3c;
            }
            .footer {
                text-align: center;
                color: #7f8c8d;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Bloodline DNA Testing Service</div>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hello, <strong>${userName}</strong>!</p>
                <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="reset-button">Reset Password</a>
                </div>
                
                <p>If the button above doesn't work, please copy and paste the following link into your browser:</p>
                <div class="reset-link">
                    <a href="${resetLink}">${resetLink}</a>
                </div>
                
                <p>This password reset link will expire in 1 hour.</p>
                
                <p>If you did not request a password reset, please contact our support team immediately.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Bloodline DNA Testing Service. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Tạo HTML template cho email thông báo
 * @param userName Tên người dùng
 * @param title Tiêu đề thông báo
 * @param message Nội dung thông báo
 * @param actionLink Link hành động (tùy chọn)
 * @param actionText Nội dung nút hành động (tùy chọn)
 * @returns HTML string
 */
export const createNotificationEmailTemplate = (
    userName: string,
    title: string,
    message: string,
    actionLink?: string,
    actionText?: string
): string => {
    const actionButton = actionLink && actionText
        ? `<div style="text-align: center;">
            <a href="${actionLink}" style="display: inline-block; background-color: #3498db; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin: 20px 0; font-weight: bold;">${actionText}</a>
           </div>`
        : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #eee;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
            }
            .content {
                padding: 20px 0;
            }
            .footer {
                text-align: center;
                color: #7f8c8d;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Bloodline DNA Testing Service</div>
            </div>
            <div class="content">
                <h2>${title}</h2>
                <p>Hello, <strong>${userName}</strong>!</p>
                <p>${message}</p>
                
                ${actionButton}
                
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Bloodline DNA Testing Service. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Gửi email với nội dung đã được định dạng
 * @param sendMailDetail Chi tiết email cần gửi
 * @returns Promise<any>
 */
export const sendMail = async (sendMailDetail: ISendMailDetail): Promise<any> => {
    const { toMail, subject, content, html } = sendMailDetail;

    const emailAdmin = process.env.EMAIL_USER;

    // Tạo transporter cho nodemailer
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: emailAdmin,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // Cấu hình email
    const mailOptions = {
        from: `"Bloodline DNA Testing Service" <${emailAdmin}>`,
        to: toMail,
        subject,
        text: content || '',
        html: html || (content ? `<p>${content}</p>` : ''),
    };

    try {
        // Gửi email
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw error;
    }
};
