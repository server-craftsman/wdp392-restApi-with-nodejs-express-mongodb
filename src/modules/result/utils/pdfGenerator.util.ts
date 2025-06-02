import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import axios from 'axios';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { HttpException } from '../../../core/exceptions';
import { HttpStatus } from '../../../core/enums';

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Đường dẫn đến font Times-Roman mặc định có sẵn trong PDFKit
// PDFKit có sẵn các font: 'Courier', 'Courier-Bold', 'Courier-Oblique', 'Courier-BoldOblique',
// 'Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique',
// 'Times-Roman', 'Times-Bold', 'Times-Italic', 'Times-BoldItalic'

/**
 * Interface for data required to generate a test result PDF
 */
export interface TestResultReportData {
    // Test result data
    resultId: string;
    isMatch: boolean;
    resultData: any;
    completedAt: Date;

    // Sample data
    sampleId: string;
    sampleType: string;
    collectionMethod: string;
    collectionDate: Date;

    // Additional data for multiple samples
    allSampleIds?: string[];

    // Appointment data
    appointmentId: string;
    appointmentDate: Date;
    serviceType: string;

    // Customer data
    customerId: string;
    customerName: string;
    customerGender: string;
    customerDateOfBirth: Date;
    customerContactInfo: {
        email: string;
        phone: string;
        address: string;
    };

    // Laboratory technician data
    labTechnicianId: string;
    labTechnicianName: string;
}

/**
 * Generate a PDF report for a test result in Vietnamese
 */
export async function generateTestResultPDF(data: TestResultReportData): Promise<string> {
    // Validate AWS environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
        throw new HttpException(
            HttpStatus.InternalServerError,
            'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION environment variables.'
        );
    }

    if (!process.env.AWS_S3_BUCKET_NAME) {
        throw new HttpException(
            HttpStatus.InternalServerError,
            'AWS S3 bucket not configured. Please set AWS_S3_BUCKET_NAME environment variable.'
        );
    }

    const tempFilePath = path.join(__dirname, `temp-report-${uuidv4()}.pdf`);

    try {
        // Tạo tài liệu PDF với lề tốt hơn cho giao diện chuyên nghiệp
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Báo Cáo Kết Quả Xét Nghiệm - ${data.resultId}`,
                Author: 'Hệ Thống Y Tế',
                Subject: 'Kết Quả Xét Nghiệm Y Tế',
                Keywords: 'xét nghiệm, y tế, kết quả'
            },
            autoFirstPage: true
        });
        const writeStream = fs.createWriteStream(tempFilePath);

        // Pipe the PDF to the file
        doc.pipe(writeStream);

        // Thêm placeholder cho logo thay vì tải hình ảnh
        doc.rect(50, 45, 150, 50).stroke('#cccccc');
        doc.fontSize(12).fillColor('#999999').text('Logo', 100, 65);

        // Thêm đường trang trí cho header
        doc.lineWidth(1)
            .moveTo(50, 110)
            .lineTo(550, 110)
            .stroke('#0066cc');

        // Thêm header với kiểu dáng tốt hơn - sử dụng ASCII thay vì Unicode
        doc.fontSize(22).fillColor('#0066cc').text('BAO CAO KET QUA XET NGHIEM', { align: 'center' });
        doc.moveDown(0.5);

        // Thêm định danh báo cáo với định dạng cải tiến - sử dụng ASCII thay vì Unicode
        const dateStr = moment().locale('vi').format('DD/MM/YYYY');
        doc.fontSize(11).fillColor('#666666').text(`Ma bao cao: ${data.resultId}`, { align: 'right' });
        doc.text(`Ngay tao: ${dateStr}`, { align: 'right' });
        doc.moveDown(2);

        // Thêm thông tin khách hàng với kiểu dáng tốt hơn
        doc.roundedRect(50, doc.y, 500, 140, 5).fillAndStroke('#f6f6f6', '#dddddd');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').text('THONG TIN KHACH HANG', 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333');
        doc.text(`Ho va ten: ${data.customerName}`, 70);
        doc.text(`Gioi tinh: ${convertToASCII(translateGender(data.customerGender))}`);
        doc.text(`Ngay sinh: ${moment(data.customerDateOfBirth).format('DD/MM/YYYY')}`);
        doc.text(`Dien thoai: ${data.customerContactInfo.phone}`);
        doc.text(`Email: ${data.customerContactInfo.email}`);
        doc.text(`Dia chi: ${data.customerContactInfo.address}`);
        doc.moveDown(1);
        doc.y += 10;

        // Thêm thông tin mẫu với phần được tạo kiểu
        doc.roundedRect(50, doc.y, 500, 110, 5).fillAndStroke('#f0f7ff', '#bbddff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').text('THONG TIN MAU XET NGHIEM', 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333');
        doc.text(`Ma mau: ${data.sampleId}`, 70);
        doc.text(`Loai mau: ${convertToASCII(translateSampleType(data.sampleType))}`);
        doc.text(`Phuong phap thu thap: ${convertToASCII(translateCollectionMethod(data.collectionMethod))}`);
        doc.text(`Ngay thu thap: ${moment(data.collectionDate).format('DD/MM/YYYY')}`);

        // Hiển thị thông tin về các mẫu bổ sung nếu có
        if (data.allSampleIds && data.allSampleIds.length > 1) {
            doc.moveDown(0.5);
            doc.text(`So luong mau: ${data.allSampleIds.length}`, 70);

            // Hiển thị danh sách các ID mẫu (tối đa 5 mẫu để tránh quá dài)
            const displaySampleIds = data.allSampleIds.slice(0, 5);
            const remainingSamples = data.allSampleIds.length - 5;

            doc.text(`Danh sach ma mau: ${displaySampleIds.join(', ')}${remainingSamples > 0 ? ` va ${remainingSamples} mau khac` : ''}`, 70);
        }

        doc.moveDown(1);
        doc.y += 10;

        // Thêm thông tin cuộc hẹn với phần được tạo kiểu
        doc.roundedRect(50, doc.y, 500, 90, 5).fillAndStroke('#f5f0ff', '#ccbbff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').text('THONG TIN CUOC HEN', 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333');
        doc.text(`Ma cuoc hen: ${data.appointmentId}`, 70);
        doc.text(`Ngay hen: ${moment(data.appointmentDate).format('DD/MM/YYYY')}`);
        doc.text(`Loai dich vu: ${convertToASCII(translateServiceType(data.serviceType))}`);
        doc.moveDown(1);
        doc.y += 10;

        // Thêm kết quả xét nghiệm với kiểu nổi bật
        doc.addPage();

        // Thêm đường trang trí cho trang kết quả
        doc.lineWidth(2)
            .moveTo(50, 70)
            .lineTo(550, 70)
            .stroke('#0066cc');

        doc.fontSize(20).fillColor('#0066cc').text('KET QUA XET NGHIEM', { align: 'center' });
        doc.moveDown(1);

        // Hiển thị kết quả khớp một cách nổi bật với chỉ báo trực quan tốt hơn
        const resultBoxHeight = 60;
        const resultBoxY = doc.y;

        doc.roundedRect(150, resultBoxY, 300, resultBoxHeight, 10)
            .fillAndStroke(data.isMatch ? '#e6ffe6' : '#ffe6e6', data.isMatch ? '#00cc00' : '#cc0000');

        doc.fontSize(18).fillColor(data.isMatch ? '#006600' : '#990000');
        doc.text(`Ket qua: ${data.isMatch ? 'KHOP' : 'KHONG KHOP'}`, 150, resultBoxY + 20, {
            align: 'center',
            width: 300
        });

        doc.y = resultBoxY + resultBoxHeight + 20;

        // Thêm kết quả chi tiết với định dạng tốt hơn
        if (data.resultData) {
            doc.fontSize(16).fillColor('#0066cc').text('Chi tiet ket qua xet nghiem:', { underline: true });
            doc.moveDown(0.5);

            // Lấy các khóa từ dữ liệu kết quả
            const details = data.resultData;
            const keys = Object.keys(details);

            // Tạo cấu trúc giống bảng cho kết quả
            const startY = doc.y;
            let currentY = startY;

            // Vẽ header bảng
            doc.rect(50, currentY, 500, 30).fillAndStroke('#0066cc', '#0066cc');
            doc.fillColor('#ffffff').fontSize(14).text('Chi so', 70, currentY + 8);
            doc.text('Gia tri', 350, currentY + 8);
            currentY += 30;

            // Thêm từng điểm dữ liệu kết quả trong các hàng màu xen kẽ
            keys.forEach((key, index) => {
                const isEvenRow = index % 2 === 0;
                const rowColor = isEvenRow ? '#f2f2f2' : '#ffffff';

                doc.rect(50, currentY, 500, 25).fill(rowColor);

                const formattedKey = convertToASCII(translateResultKey(key));
                doc.fillColor('#333333').fontSize(12)
                    .text(formattedKey, 70, currentY + 6);
                doc.text(`${details[key]}`, 350, currentY + 6);

                currentY += 25;
            });

            // Vẽ đường viền xung quanh toàn bộ bảng
            doc.rect(50, startY, 500, currentY - startY).stroke('#cccccc');
        }

        doc.moveDown(1.5);

        // Thêm thông tin kỹ thuật viên phòng thí nghiệm với phần được tạo kiểu
        doc.roundedRect(50, doc.y, 500, 80, 5).fillAndStroke('#f0f7ff', '#bbddff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').text('THONG TIN PHONG XET NGHIEM', 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333');
        doc.text(`Ky thuat vien: ${data.labTechnicianName}`, 70);
        doc.text(`Ngay hoan thanh: ${moment(data.completedAt).format('DD/MM/YYYY')}`);
        doc.moveDown(1.5);

        // Thêm dòng chữ ký với kiểu dáng tốt hơn
        doc.y += 20;
        doc.fontSize(12).fillColor('#333333').text('Chu ky xac nhan', 70);
        doc.lineCap('butt')
            .moveTo(70, doc.y + 40)
            .lineTo(250, doc.y + 40)
            .stroke('#333333');
        doc.text('Ky thuat vien xet nghiem', 70, doc.y + 45);

        // Thêm placeholder cho con dấu công ty
        doc.circle(400, doc.y + 30, 40).stroke('#999999');
        doc.fontSize(10).fillColor('#999999').text('Dau cua', 380, doc.y + 25);
        doc.text('don vi', 385, doc.y + 38);

        // Thêm footer với tuyên bố từ chối trách nhiệm nhưng không có đánh số trang
        const footerY = doc.page.height - 50;
        doc.lineWidth(0.5)
            .moveTo(50, footerY - 15)
            .lineTo(550, footerY - 15)
            .stroke('#cccccc');

        doc.fontSize(10).fillColor('#666666').text(
            'Bao cao nay duoc tao tu dong va co gia tri ma khong can chu ky. ' +
            'Ket qua nen duoc giai thich boi cac chuyen gia y te co trinh do.',
            50, footerY, { width: 500, align: 'center' }
        );

        // Hoàn thiện PDF
        doc.end();

        // Đợi cho file được ghi
        await new Promise<void>((resolve) => {
            writeStream.on('finish', () => {
                resolve();
            });
        });

        // Tải lên S3
        try {
            const fileContent = fs.readFileSync(tempFilePath);
            const timestamp = moment().format('YYYYMMDD-HHmmss');
            const fileName = `test-results/${data.customerId}/${data.resultId}-${timestamp}.pdf`;

            console.log(`Uploading PDF to S3 with filename: ${fileName}`);
            console.log(`Using bucket: ${process.env.AWS_S3_BUCKET_NAME}`);

            // Tải lên S3
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: fileName,
                Body: fileContent,
                ContentType: 'application/pdf',
                // TODO: Uncomment this when we have a way to handle the ACL
                // ACL: 'public-read' 
            };

            console.log('Starting S3 upload...');
            const uploadResult = await s3.upload(params).promise();
            console.log('S3 upload completed successfully:', uploadResult.Location);

            // Xóa file tạm
            fs.unlinkSync(tempFilePath);

            return uploadResult.Location;
        } catch (error: any) {
            throw new HttpException(
                HttpStatus.InternalServerError,
                `Error processing PDF: ${error.message}`
            );
        }
    } catch (error: any) {
        // Dọn dẹp file tạm nếu nó tồn tại
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }

        console.error('Error generating or uploading PDF:', error);
        throw new HttpException(
            HttpStatus.InternalServerError,
            `Failed to generate or upload PDF report: ${error.message}`
        );
    }
}

/**
 * Hàm chuyển đổi ký tự Unicode tiếng Việt sang ASCII
 */
function convertToASCII(text: string): string {
    return text
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
        .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
        .replace(/[ÌÍỊỈĨ]/g, 'I')
        .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
        .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
        .replace(/[ỲÝỴỶỸ]/g, 'Y')
        .replace(/Đ/g, 'D');
}

/**
 * Các hàm trợ giúp để dịch các thuật ngữ sang tiếng Việt
 */
function translateGender(gender: string): string {
    const genderMap: Record<string, string> = {
        'male': 'Nam',
        'female': 'Nữ',
        'other': 'Khác'
    };
    return genderMap[gender.toLowerCase()] || gender;
}

function translateSampleType(sampleType: string): string {
    const sampleTypeMap: Record<string, string> = {
        'blood': 'Máu',
        'urine': 'Nước tiểu',
        'hair': 'Tóc',
        'saliva': 'Nước bọt',
        'tissue': 'Mô',
        'swab': 'Tăm bông'
    };
    return sampleTypeMap[sampleType.toLowerCase()] || sampleType;
}

function translateCollectionMethod(method: string): string {
    const methodMap: Record<string, string> = {
        'venipuncture': 'Lấy máu tĩnh mạch',
        'finger prick': 'Lấy máu đầu ngón tay',
        'swab collection': 'Thu thập bằng tăm bông',
        'clean catch': 'Thu thập sạch',
        'self': 'Tự thu thập'
    };
    return methodMap[method.toLowerCase()] || method;
}

function translateServiceType(serviceType: string): string {
    const serviceTypeMap: Record<string, string> = {
        'general checkup': 'Khám tổng quát',
        'blood test': 'Xét nghiệm máu',
        'genetic test': 'Xét nghiệm di truyền',
        'allergy test': 'Xét nghiệm dị ứng',
        'covid test': 'Xét nghiệm COVID',
        'dna test': 'Xét nghiệm ADN',
        'DNA Paternity Test': 'Xét nghiệm ADN xác định huyết thống'
    };
    return serviceTypeMap[serviceType.toLowerCase()] || serviceType;
}

function translateResultKey(key: string): string {
    // Chuyển đổi snake_case sang định dạng có thể đọc được và dịch
    const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const resultKeyMap: Record<string, string> = {
        'Blood Pressure': 'Huyết áp',
        'Heart Rate': 'Nhịp tim',
        'Glucose Level': 'Mức đường huyết',
        'Cholesterol': 'Cholesterol',
        'Hemoglobin': 'Hemoglobin',
        'White Blood Cell Count': 'Số lượng bạch cầu',
        'Red Blood Cell Count': 'Số lượng hồng cầu',
        'Platelet Count': 'Số lượng tiểu cầu',
        'Dna Match': 'Khớp ADN',
        'Match Percentage': 'Tỷ lệ khớp',
        'Match Score': 'Điểm khớp',
        'Confidence Level': 'Mức độ tin cậy'
    };

    return resultKeyMap[formattedKey] || formattedKey;
}         