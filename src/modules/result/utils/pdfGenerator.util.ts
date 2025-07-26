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
    region: process.env.AWS_REGION,
});

/**
 * Information about persons related to the sample
 */
export interface PersonInfo {
    name: string;
    relationship: string;
    dob: Date | null;
    birthPlace: string;
    nationality: string;
    identityDocument: string;
    sampleId: string;
    imageUrl?: string; // URL to the person's image
}

/**
 * Interface for data required to generate a test result PDF
 */
export interface TestResultReportData {
    // Test result data
    resultId: string;
    isMatch: boolean | undefined;
    resultData: any;
    completedAt: Date;

    // Sample data
    sampleId: string;
    sampleType: string;
    collectionMethod: string;
    collectionDate: Date;

    // Additional data for multiple samples
    allSampleIds?: string[];
    personsInfo?: PersonInfo[];

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
        phone: string | number;
        address: string;
    };

    // Laboratory technician data
    labTechnicianId: string;
    labTechnicianName: string;

    // Administrative case data
    caseNumber?: string;
    agencyName?: string;
    agencyContact?: string;
}

/**
 * Ensure proper UTF-8 encoding for Vietnamese text
 */
function ensureUTF8(text: string): string {
    if (!text) return '';
    // Normalize Unicode characters for proper display
    return text.normalize('NFC');
}

/**
 * Convert Vietnamese text to a more compatible format for PDF
 */
function makeVietnameseCompatible(text: string): string {
    if (!text) return '';

    // First normalize the text
    let normalized = text.normalize('NFC');

    // Replace some problematic characters with alternatives
    const replacements: { [key: string]: string } = {
        'Đ': 'D', 'đ': 'd',  // Đ/đ can sometimes cause issues
        'Ư': 'U', 'ư': 'u',  // Ư/ư can sometimes cause issues
        'Ơ': 'O', 'ơ': 'o',  // Ơ/ơ can sometimes cause issues
        'Ă': 'A', 'ă': 'a',  // Ă/ă can sometimes cause issues
    };

    // Apply replacements
    for (const [from, to] of Object.entries(replacements)) {
        normalized = normalized.replace(new RegExp(from, 'g'), to);
    }

    return normalized;
}

/**
 * Parse and format address from JSON string or object
 */
function formatAddress(address: string | any): string {
    if (!address) return '';

    try {
        // If address is already a string, try to parse it as JSON
        let addressObj: any;
        if (typeof address === 'string') {
            addressObj = JSON.parse(address);
        } else {
            addressObj = address;
        }

        // Build formatted address
        const parts = [];
        if (addressObj.street) parts.push(addressObj.street);
        if (addressObj.ward) parts.push(addressObj.ward);
        if (addressObj.district) parts.push(addressObj.district);
        if (addressObj.city) parts.push(addressObj.city);
        if (addressObj.country) parts.push(addressObj.country);

        return parts.join(', ');
    } catch (error) {
        // If parsing fails, return the original string
        console.warn('Failed to parse address:', address);
        return typeof address === 'string' ? address : JSON.stringify(address);
    }
}

/**
 * Safely render Vietnamese text in PDF with fallback options
 */
function renderVietnameseText(doc: PDFKit.PDFDocument, text: string, options: any = {}): void {
    if (!text) return;

    // Simple approach: use normalized text with fallback to transliteration
    try {
        // First try with normalized Unicode
        const normalized = text.normalize('NFC');
        doc.text(normalized, options);
    } catch (error) {
        console.warn('Unicode text rendering failed, using transliteration:', error);
        // Fallback to transliteration
        const transliterated = text
            .replace(/[àáảãạăằắẳẵặâầấẩẫậ]/g, 'a')
            .replace(/[èéẻẽẹêềếểễệ]/g, 'e')
            .replace(/[ìíỉĩị]/g, 'i')
            .replace(/[òóỏõọôồốổỗộơờớởỡợ]/g, 'o')
            .replace(/[ùúủũụưừứửữự]/g, 'u')
            .replace(/[ỳýỷỹỵ]/g, 'y')
            .replace(/[đ]/g, 'd')
            .replace(/[ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬ]/g, 'A')
            .replace(/[ÈÉẺẼẸÊỀẾỂỄỆ]/g, 'E')
            .replace(/[ÌÍỈĨỊ]/g, 'I')
            .replace(/[ÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ]/g, 'O')
            .replace(/[ÙÚỦŨỤƯỪỨỬỮỰ]/g, 'U')
            .replace(/[ỲÝỶỸỴ]/g, 'Y')
            .replace(/[Đ]/g, 'D');
        doc.text(transliterated, options);
    }
}

/**
 * Generate a PDF report for a test result using Unicode fonts
 */
export async function generateTestResultPDF(data: TestResultReportData, template?: string): Promise<string> {
    // Validate AWS environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
        throw new HttpException(HttpStatus.InternalServerError, 'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION environment variables.');
    }

    if (!process.env.AWS_S3_BUCKET_NAME) {
        throw new HttpException(HttpStatus.InternalServerError, 'AWS S3 bucket not configured. Please set AWS_S3_BUCKET_NAME environment variable.');
    }

    const tempFilePath = path.join(__dirname, `temp-report-${uuidv4()}.pdf`);

    try {
        // Create PDF document with Unicode support
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Báo cáo kết quả xét nghiệm - ${data.resultId}`,
                Author: 'Hệ thống Y tế',
                Subject: 'Kết quả xét nghiệm y tế',
                Keywords: 'xét nghiệm, y tế, kết quả',
                Creator: 'DNA Testing System',
                Producer: 'PDFKit',
            },
            autoFirstPage: true,
            lang: 'vi-VN', // Set language to Vietnamese
            pdfVersion: '1.7', // Use newer PDF version for better Unicode support
            compress: true, // Enable compression
            userPassword: undefined, // No password protection
            ownerPassword: undefined,
            permissions: {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: true,
                documentAssembly: false
            }
        });
        const writeStream = fs.createWriteStream(tempFilePath);

        // Pipe the PDF to the file
        doc.pipe(writeStream);

        // Try to register Unicode fonts, fallback to default if not available
        let regularFontName = 'Helvetica';
        let boldFontName = 'Helvetica-Bold';

        // Try different font options for Vietnamese support
        const fontOptions = [
            // Option 1: Try to use Noto Sans fonts
            {
                regular: path.join(__dirname, '../../../assets/fonts/NotoSans-Regular.ttf'),
                bold: path.join(__dirname, '../../../assets/fonts/NotoSans-Bold.ttf'),
                names: { regular: 'NotoSans', bold: 'NotoSans-Bold' }
            },
            // Option 2: Try to use system fonts that support Vietnamese
            {
                regular: path.join(__dirname, '../../../assets/fonts/Roboto-Regular.ttf'),
                bold: path.join(__dirname, '../../../assets/fonts/Roboto-Bold.ttf'),
                names: { regular: 'Roboto', bold: 'Roboto-Bold' }
            },
            // Option 3: Try to use Arial Unicode MS (if available)
            {
                regular: path.join(__dirname, '../../../assets/fonts/ArialUnicodeMS.ttf'),
                bold: path.join(__dirname, '../../../assets/fonts/ArialUnicodeMS-Bold.ttf'),
                names: { regular: 'ArialUnicodeMS', bold: 'ArialUnicodeMS-Bold' }
            }
        ];

        let fontLoaded = false;
        for (const fontOption of fontOptions) {
            try {
                if (fs.existsSync(fontOption.regular) && fs.existsSync(fontOption.bold)) {
                    doc.registerFont(fontOption.names.regular, fontOption.regular);
                    doc.registerFont(fontOption.names.bold, fontOption.bold);
                    regularFontName = fontOption.names.regular;
                    boldFontName = fontOption.names.bold;
                    console.log(`Using ${fontOption.names.regular} fonts for Vietnamese support`);
                    fontLoaded = true;
                    break;
                }
            } catch (fontError) {
                console.warn(`Font registration failed for ${fontOption.names.regular}:`, fontError);
                continue;
            }
        }

        if (!fontLoaded) {
            console.log('No custom fonts found, using default fonts with Unicode support');
            // Try to use built-in fonts that might support Vietnamese better
            try {
                // Some PDFKit versions have better Unicode support with certain fonts
                regularFontName = 'Helvetica';
                boldFontName = 'Helvetica-Bold';
            } catch (error) {
                console.warn('Using fallback fonts:', error);
            }
        }

        // === ADMINISTRATIVE PDF CUSTOMIZATION ===
        if (template === 'administrative_report_template') {
            // Watermark
            doc.fontSize(60).fillColor('#eeeeee').opacity(0.3).font(boldFontName);
            renderVietnameseText(doc, 'HÀNH CHÍNH', { x: 100, y: 300 });
            doc.opacity(1);
            // Header
            doc.fontSize(18).fillColor('#cc0000').font(boldFontName);
            renderVietnameseText(doc, 'BÁO CÁO XÉT NGHIỆM ADN HÀNH CHÍNH', { align: 'center' });
            doc.moveDown(0.5);
            // Số hiệu vụ việc
            if (data.caseNumber) {
                doc.fontSize(12).fillColor('#333333').font(regularFontName);
                renderVietnameseText(doc, `Số vụ việc: ${data.caseNumber}`, { align: 'right' });
            }
            if (data.agencyName) {
                doc.fontSize(12).fillColor('#333333').font(regularFontName);
                renderVietnameseText(doc, `Cơ quan: ${data.agencyName}`, { align: 'right' });
            }
            doc.moveDown(1);
        } else {
            // Add decorative line for header
            doc.lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke('#0066cc');
            // Add header with better styling
            doc.fontSize(22).fillColor('#0066cc').font(boldFontName);
            renderVietnameseText(doc, 'BÁO CÁO KẾT QUẢ XÉT NGHIỆM', { align: 'center' });
            doc.moveDown(0.5);
        }

        // Add report identification with improved formatting
        const dateStr = moment().locale('vi').format('DD/MM/YYYY');
        doc.fontSize(11).fillColor('#666666').font(regularFontName).text(`Mã báo cáo: ${data.resultId}`, { align: 'right' });
        doc.text(`Ngày tạo: ${dateStr}`, { align: 'right' });
        doc.moveDown(2);

        // Add customer information with better styling
        doc.roundedRect(50, doc.y, 500, 140, 5).fillAndStroke('#f6f6f6', '#dddddd');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').font(boldFontName);
        renderVietnameseText(doc, 'THÔNG TIN KHÁCH HÀNG', { x: 70, y: doc.y });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333').font(regularFontName);
        renderVietnameseText(doc, `Họ và tên: ${data.customerName}`, { x: 70 });
        renderVietnameseText(doc, `Giới tính: ${translateGender(data.customerGender)}`, { x: 70 });
        renderVietnameseText(doc, `Ngày sinh: ${moment(data.customerDateOfBirth).format('DD/MM/YYYY')}`, { x: 70 });
        renderVietnameseText(doc, `Điện thoại: ${data.customerContactInfo.phone}`, { x: 70 });
        renderVietnameseText(doc, `Email: ${data.customerContactInfo.email}`, { x: 70 });

        // Format address properly
        const formattedAddress = formatAddress(data.customerContactInfo.address);
        renderVietnameseText(doc, `Địa chỉ: ${formattedAddress}`, { x: 70 });

        doc.moveDown(1);
        doc.y += 10;

        // Display information about persons related to the sample if available
        if (data.personsInfo && data.personsInfo.length > 0) {
            doc.addPage();
            doc.fontSize(18).fillColor('#0066cc').font(boldFontName).text(ensureUTF8('THÔNG TIN NGƯỜI LIÊN QUAN'), { align: 'center' });
            doc.moveDown(1);

            // Display information for each person
            for (let i = 0; i < data.personsInfo.length; i++) {
                const person = data.personsInfo[i];

                doc.roundedRect(50, doc.y, 500, 220, 5).fillAndStroke('#f0f7ff', '#bbddff');
                doc.y += 10;

                doc.fontSize(14)
                    .fillColor('#0066cc')
                    .font(boldFontName)
                    .text(ensureUTF8(`NGƯỜI THỬ ${i + 1}`), 70, doc.y);
                doc.moveDown(0.2);

                // Add person image if available
                if (person.imageUrl) {
                    try {
                        // Download the image from the URL
                        const response = await axios.get(person.imageUrl, {
                            responseType: 'arraybuffer',
                        });

                        // Create a buffer from the response data
                        const imageBuffer = Buffer.from(response.data, 'binary');

                        // Calculate image position (right side of the person info)
                        const imageX = 400;
                        const imageY = doc.y;

                        // Add the image to the PDF with a maximum width/height of 100px
                        doc.image(imageBuffer, imageX, imageY, {
                            fit: [100, 100],
                            align: 'right',
                        });
                    } catch (error) {
                        console.error(`Error adding person image for ${person.name}:`, error);
                        // Continue without the image if there's an error
                    }
                }

                doc.fontSize(10).fillColor('#333333').font(regularFontName);
                doc.text(ensureUTF8(`Họ và tên: ${person.name}`), 70);
                doc.text(ensureUTF8(`Mối quan hệ: ${person.relationship}`), 70);
                if (person.dob) {
                    doc.text(ensureUTF8(`Ngày sinh: ${moment(person.dob).format('DD/MM/YYYY')}`), 70);
                }
                doc.text(ensureUTF8(`Nơi sinh: ${person.birthPlace}`), 70);
                doc.text(ensureUTF8(`Quốc tịch: ${person.nationality}`), 70);
                if (person.identityDocument) {
                    doc.text(ensureUTF8(`CMND/CCCD: ${person.identityDocument}`), 70);
                }
                doc.text(ensureUTF8(`Mã mẫu: ${person.sampleId}`), 70);

                doc.moveDown(1);
                doc.y += 20;

                // Add new page if there are more people and not enough space
                if (i < data.personsInfo.length - 1 && doc.y > 650) {
                    doc.addPage();
                }
            }
        }

        // Add sample information with styled section
        doc.addPage();
        doc.roundedRect(50, doc.y, 500, 110, 5).fillAndStroke('#f0f7ff', '#bbddff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(ensureUTF8('THÔNG TIN MẪU XÉT NGHIỆM'), 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333').font(regularFontName);
        // Display information about additional samples if available
        if (data.allSampleIds && data.allSampleIds.length > 1) {
            doc.moveDown(0.2);
            doc.text(ensureUTF8(`Số lượng mẫu: ${data.allSampleIds.length}`), 70);

            // Display list of sample IDs (maximum 5 samples to avoid excessive length)
            const displaySampleIds = data.allSampleIds.slice(0, 5);
            const remainingSamples = data.allSampleIds.length - 5;

            doc.text(ensureUTF8(`Danh sách mã mẫu: ${displaySampleIds.join(', ')}${remainingSamples > 0 ? ` và ${remainingSamples} mẫu khác` : ''}`), 70);
        }
        doc.text(ensureUTF8(`Loại mẫu: ${translateSampleType(data.sampleType)}`), 70);
        doc.text(ensureUTF8(`Phương pháp lấy mẫu: ${translateCollectionMethod(data.collectionMethod)}`), 70);
        doc.text(ensureUTF8(`Ngày lấy mẫu: ${moment(data.collectionDate).format('DD/MM/YYYY')}`), 70);

        doc.moveDown(1);
        doc.y += 10;

        // Add appointment information with styled section
        doc.roundedRect(50, doc.y, 500, 90, 5).fillAndStroke('#f5f0ff', '#ccbbff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(ensureUTF8('THÔNG TIN LỊCH HẸN'), 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333').font(regularFontName);
        doc.text(ensureUTF8(`Mã lịch hẹn: ${data.appointmentId}`), 70);
        doc.text(ensureUTF8(`Ngày hẹn: ${moment(data.appointmentDate).format('DD/MM/YYYY')}`), 70);
        doc.text(ensureUTF8(`Loại dịch vụ: ${translateServiceType(data.serviceType)}`), 70);
        doc.moveDown(1);
        doc.y += 10;

        // Add test results with prominent styling
        doc.addPage();

        // Add decorative line for results page
        doc.lineWidth(2).moveTo(50, 70).lineTo(550, 70).stroke('#0066cc');

        doc.fontSize(20).fillColor('#0066cc').font(boldFontName).text(ensureUTF8('KẾT QUẢ XÉT NGHIỆM'), { align: 'center' });
        doc.moveDown(1);

        // Display match results prominently with improved visual indicator
        const resultBoxHeight = 60;
        const resultBoxY = doc.y;

        doc.roundedRect(150, resultBoxY, 300, resultBoxHeight, 10).fillAndStroke(data.isMatch ? '#e6ffe6' : '#ffe6e6', data.isMatch ? '#00cc00' : '#cc0000');

        doc.fontSize(18)
            .fillColor(data.isMatch ? '#006600' : '#990000')
            .font(boldFontName);
        doc.text(ensureUTF8(`Kết quả: ${data.isMatch ? 'KHỚP' : 'KHÔNG KHỚP'}`), 150, resultBoxY + 20, {
            align: 'center',
            width: 300,
        });

        doc.y = resultBoxY + resultBoxHeight + 20;

        // Add detailed results with improved formatting
        if (data.resultData) {
            doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(ensureUTF8('KẾT QUẢ CHI TIẾT:'), { underline: true });
            doc.moveDown(0.5);

            // Get keys from result data
            const details = data.resultData;
            const keys = Object.keys(details);

            // Create table-like structure for results
            const startY = doc.y;
            let currentY = startY;

            // Draw table header
            doc.rect(50, currentY, 500, 30).fillAndStroke('#0066cc', '#0066cc');
            doc.fillColor('#ffffff')
                .fontSize(14)
                .font(boldFontName)
                .text(ensureUTF8('Thông số'), 70, currentY + 8);
            doc.text(ensureUTF8('Giá trị'), 350, currentY + 8);
            currentY += 30;

            // Add each result data point in alternating color rows
            keys.forEach((key, index) => {
                const isEvenRow = index % 2 === 0;
                const rowColor = isEvenRow ? '#f2f2f2' : '#ffffff';

                doc.rect(50, currentY, 500, 25).fill(rowColor);

                const formattedKey = translateResultKey(key);
                doc.fillColor('#333333')
                    .fontSize(12)
                    .font(regularFontName)
                    .text(ensureUTF8(formattedKey), 70, currentY + 6);
                doc.text(ensureUTF8(`${details[key]}`), 350, currentY + 6);

                currentY += 25;
            });

            // Draw border around entire table
            doc.rect(50, startY, 500, currentY - startY).stroke('#cccccc');
        }

        doc.moveDown(1.5);

        // Add laboratory technician information with styled section
        doc.roundedRect(50, doc.y, 500, 80, 5).fillAndStroke('#f0f7ff', '#bbddff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(ensureUTF8('THÔNG TIN PHÒNG XÉT NGHIỆM'), 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333').font(regularFontName);
        doc.text(ensureUTF8(`Kỹ thuật viên: ${data.labTechnicianName}`), 70);
        doc.text(ensureUTF8(`Ngày hoàn thành: ${moment(data.completedAt).format('DD/MM/YYYY')}`), 70);
        doc.moveDown(1.5);

        // Administrative specific section
        if (template === 'administrative_report_template') {
            doc.addPage();
            doc.fontSize(16).fillColor('#cc0000').font(boldFontName).text(ensureUTF8('XÁC NHẬN CỦA CÁN BỘ'), { align: 'center' });
            doc.moveDown(1);
            doc.fontSize(12).fillColor('#333333').font(regularFontName).text(ensureUTF8('Báo cáo này được cấp cho mục đích hành chính/pháp lý.'), 70);
            doc.moveDown(1);
            doc.text(ensureUTF8('Đại diện cán bộ: ___________________________'), 70);
            doc.moveDown(0.5);
            doc.text(ensureUTF8('Chức vụ: _______________________________________'), 70);
            doc.moveDown(0.5);
            doc.text(ensureUTF8('Ngày: ___________________   Chữ ký: ___________________'), 70);
            doc.moveDown(2);
        }

        // Add signature line with improved styling
        doc.y += 20;
        doc.fontSize(12).fillColor('#333333').font(regularFontName).text(ensureUTF8('Chữ ký'), 70);
        doc.lineCap('butt')
            .moveTo(70, doc.y + 40)
            .lineTo(250, doc.y + 40)
            .stroke('#333333');
        doc.text(ensureUTF8('Kỹ thuật viên phòng xét nghiệm'), 70, doc.y + 45);

        // Add placeholder for company seal
        doc.circle(400, doc.y + 30, 40).stroke('#999999');
        doc.fontSize(10)
            .fillColor('#999999')
            .font(regularFontName)
            .text(ensureUTF8('Con dấu'), 380, doc.y + 25);
        doc.text(ensureUTF8('chính thức'), 375, doc.y + 38);

        // Add footer with disclaimer but no page numbering
        const footerY = doc.page.height - 50;
        doc.lineWidth(0.5)
            .moveTo(50, footerY - 15)
            .lineTo(550, footerY - 15)
            .stroke('#cccccc');

        doc.fontSize(10)
            .fillColor('#666666')
            .font(regularFontName)
            .text(ensureUTF8('Báo cáo này được tạo tự động và có hiệu lực mà không cần chữ ký. ' + 'Kết quả cần được giải thích bởi chuyên gia y tế có trình độ.'), 50, footerY, { width: 500, align: 'center' });

        // Finalize PDF
        doc.end();

        // Wait for file to be written
        await new Promise<void>((resolve) => {
            writeStream.on('finish', () => {
                resolve();
            });
        });

        // Upload to S3
        try {
            const fileContent = fs.readFileSync(tempFilePath);
            const timestamp = moment().format('YYYYMMDD-HHmmss');
            const fileName = `test-results/${data.customerId}/${data.resultId}-${timestamp}.pdf`;

            console.log(`Uploading PDF to S3 with filename: ${fileName}`);
            console.log(`Using bucket: ${process.env.AWS_S3_BUCKET_NAME}`);

            // Upload to S3
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

            // Delete temporary file
            fs.unlinkSync(tempFilePath);

            return uploadResult.Location;
        } catch (error: any) {
            throw new HttpException(HttpStatus.InternalServerError, `Error processing PDF: ${error.message}`);
        }
    } catch (error: any) {
        // Clean up temporary file if it exists
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (unlinkError) {
                console.error('Error deleting temporary file:', unlinkError);
            }
        }

        console.error('Error generating or uploading PDF:', error);
        throw new HttpException(HttpStatus.InternalServerError, `Failed to generate or upload PDF report: ${error.message}`);
    }
}

/**
 * Simple test function to generate a basic PDF with Vietnamese text
 */
export async function generateSimpleVietnameseTestPDF(): Promise<string> {
    const tempFilePath = path.join(__dirname, `test-vietnamese-${uuidv4()}.pdf`);

    try {
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: 'Test Vietnamese Text',
                Author: 'Test System',
                Subject: 'Vietnamese Text Test',
            },
            autoFirstPage: true,
            lang: 'vi-VN',
            pdfVersion: '1.7',
        });

        const writeStream = fs.createWriteStream(tempFilePath);
        doc.pipe(writeStream);

        // Test different fonts
        const fonts = ['Helvetica', 'Helvetica-Bold', 'Times-Roman', 'Times-Bold'];

        for (let i = 0; i < fonts.length; i++) {
            const font = fonts[i];
            doc.fontSize(16).font(font);
            doc.text(`Font: ${font}`, 50, 100 + i * 50);
            doc.text('Báo cáo kết quả xét nghiệm', 50, 120 + i * 50);
            doc.text('Họ và tên: Nguyễn Văn A', 50, 140 + i * 50);
            doc.text('Địa chỉ: Hà Nội, Việt Nam', 50, 160 + i * 50);
        }

        doc.end();

        await new Promise<void>((resolve) => {
            writeStream.on('finish', () => {
                resolve();
            });
        });

        // Upload to S3 for testing
        const fileContent = fs.readFileSync(tempFilePath);
        const timestamp = moment().format('YYYYMMDD-HHmmss');
        const fileName = `test-vietnamese-${timestamp}.pdf`;

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: fileName,
            Body: fileContent,
            ContentType: 'application/pdf',
        };

        const uploadResult = await s3.upload(params).promise();
        fs.unlinkSync(tempFilePath);

        return uploadResult.Location;
    } catch (error: any) {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
        throw new HttpException(HttpStatus.InternalServerError, `Test PDF generation failed: ${error.message}`);
    }
}

/**
 * Helper functions to translate terms to Vietnamese
 */
function translateGender(gender: string): string {
    const genderMap: Record<string, string> = {
        male: 'Nam',
        female: 'Nữ',
        other: 'Khác',
    };
    return ensureUTF8(genderMap[gender.toLowerCase()] || gender);
}

function translateSampleType(sampleType: string): string {
    const sampleTypeMap: Record<string, string> = {
        blood: 'Máu',
        urine: 'Nước tiểu',
        hair: 'Tóc',
        saliva: 'Nước bọt',
        tissue: 'Mô',
        swab: 'Tăm bông',
    };
    return ensureUTF8(sampleTypeMap[sampleType.toLowerCase()] || sampleType);
}

function translateCollectionMethod(method: string): string {
    const methodMap: Record<string, string> = {
        venipuncture: 'Lấy máu tĩnh mạch',
        'finger prick': 'Lấy máu đầu ngón tay',
        'swab collection': 'Thu thập bằng tăm bông',
        'clean catch': 'Thu thập sạch',
        self: 'Tự thu thập',
        facility: 'Tại cơ sở y tế',
        home: 'Tại nhà',
    };
    return ensureUTF8(methodMap[method.toLowerCase()] || method);
}

function translateServiceType(serviceType: string): string {
    const serviceTypeMap: Record<string, string> = {
        'general checkup': 'Khám tổng quát',
        'blood test': 'Xét nghiệm máu',
        'genetic test': 'Xét nghiệm di truyền',
        'allergy test': 'Xét nghiệm dị ứng',
        'covid test': 'Xét nghiệm COVID',
        'dna test': 'Xét nghiệm ADN',
        'DNA Paternity Test': 'Xét nghiệm ADN xác định huyết thống',
        administrative: 'Xét nghiệm hành chính',
    };
    return ensureUTF8(serviceTypeMap[serviceType.toLowerCase()] || serviceType);
}

function translateResultKey(key: string): string {
    // Convert snake_case to readable format and translate
    const formattedKey = key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const resultKeyMap: Record<string, string> = {
        'Blood Pressure': 'Huyết áp',
        'Heart Rate': 'Nhịp tim',
        'Glucose Level': 'Mức đường huyết',
        Cholesterol: 'Cholesterol',
        Hemoglobin: 'Hemoglobin',
        'White Blood Cell Count': 'Số lượng bạch cầu',
        'Red Blood Cell Count': 'Số lượng hồng cầu',
        'Platelet Count': 'Số lượng tiểu cầu',
        'Dna Match': 'Khớp ADN',
        'Match Percentage': 'Tỷ lệ khớp',
        'Match Score': 'Điểm khớp',
        'Confidence Level': 'Mức độ tin cậy',
    };

    return ensureUTF8(resultKeyMap[formattedKey] || formattedKey);
}
