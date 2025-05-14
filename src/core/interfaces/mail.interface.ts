interface ISendMailDetail {
    toMail: string;
    subject: string;
    content?: string;
    html?: string;
}

export default ISendMailDetail;
