import nodemailer from 'nodemailer';
import { ISendMailDetail } from '../interfaces';

export const sendMail = (sendMailDetail: ISendMailDetail) => {
    const { toMail, subject, content, html } = sendMailDetail;

    const emailAdmin = process.env.EMAIL_USER;

    // send mail with token
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: emailAdmin,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: emailAdmin,
        to: toMail,
        subject,
        text: content,
        html,
    };

    return transporter.sendMail(mailOptions);
};
