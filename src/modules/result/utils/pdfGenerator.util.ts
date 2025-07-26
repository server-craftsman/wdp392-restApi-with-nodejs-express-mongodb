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
 * Transliterate Vietnamese text to ASCII for PDF compatibility
 */
function transliterateVietnamese(text: string): string {
    if (!text) return '';

    const vietnameseMap: { [key: string]: string } = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd',
        'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D'
    };

    return text.split('').map(char => vietnameseMap[char] || char).join('');
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
 * Generate a PDF report for a test result using default fonts only
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
        // Create PDF document with improved margins for professional presentation
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Bao cao ket qua xet nghiem - ${data.resultId}`,
                Author: 'He thong Y te',
                Subject: 'Ket qua xet nghiem y te',
                Keywords: 'xet nghiem, y te, ket qua',
                Creator: 'DNA Testing System',
                Producer: 'PDFKit',
            },
            autoFirstPage: true,
        });
        const writeStream = fs.createWriteStream(tempFilePath);

        // Pipe the PDF to the file
        doc.pipe(writeStream);

        // Use default fonts only - no custom font registration
        const regularFontName = 'Helvetica';
        const boldFontName = 'Helvetica-Bold';

        console.log('Using default fonts:', { regularFontName, boldFontName });

        // === ADMINISTRATIVE PDF CUSTOMIZATION ===
        if (template === 'administrative_report_template') {
            // Watermark
            doc.fontSize(60).fillColor('#eeeeee').opacity(0.3).font(boldFontName).text(transliterateVietnamese('HANH CHINH'), 100, 300);
            doc.opacity(1);
            // Header
            doc.fontSize(18).fillColor('#cc0000').font(boldFontName).text(transliterateVietnamese('BAO CAO XET NGHIEM ADN HANH CHINH'), { align: 'center' });
            doc.moveDown(0.5);
            // So hieu vu viec
            if (data.caseNumber) {
                doc.fontSize(12).fillColor('#333333').font(regularFontName).text(transliterateVietnamese(`So vu viec: ${data.caseNumber}`), { align: 'right' });
            }
            if (data.agencyName) {
                doc.fontSize(12).fillColor('#333333').font(regularFontName).text(transliterateVietnamese(`Co quan: ${data.agencyName}`), { align: 'right' });
            }
            doc.moveDown(1);
        } else {
            // Add decorative line for header
            doc.lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke('#0066cc');
            // Add header with better styling
            doc.fontSize(22).fillColor('#0066cc').font(boldFontName).text(transliterateVietnamese('BAO CAO KET QUA XET NGHIEM'), { align: 'center' });
            doc.moveDown(0.5);
        }

        // Add report identification with improved formatting
        const dateStr = moment().locale('vi').format('DD/MM/YYYY');
        doc.fontSize(11).fillColor('#666666').font(regularFontName).text(`Ma bao cao: ${data.resultId}`, { align: 'right' });
        doc.text(`Ngay tao: ${dateStr}`, { align: 'right' });
        doc.moveDown(2);

        // Add customer information with better styling
        doc.roundedRect(50, doc.y, 500, 140, 5).fillAndStroke('#f6f6f6', '#dddddd');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(transliterateVietnamese('THONG TIN KHACH HANG'), 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333').font(regularFontName);
        doc.text(transliterateVietnamese(`Ho va ten: ${data.customerName}`), 70);
        doc.text(transliterateVietnamese(`Gioi tinh: ${translateGender(data.customerGender)}`), 70);
        doc.text(transliterateVietnamese(`Ngay sinh: ${moment(data.customerDateOfBirth).format('DD/MM/YYYY')}`), 70);
        doc.text(transliterateVietnamese(`Dien thoai: ${data.customerContactInfo.phone}`), 70);
        doc.text(transliterateVietnamese(`Email: ${data.customerContactInfo.email}`), 70);

        // Format address properly
        const formattedAddress = formatAddress(data.customerContactInfo.address);
        doc.text(transliterateVietnamese(`Dia chi: ${formattedAddress}`), 70);

        doc.moveDown(1);
        doc.y += 10;

        // Display information about persons related to the sample if available
        if (data.personsInfo && data.personsInfo.length > 0) {
            doc.addPage();
            doc.fontSize(18).fillColor('#0066cc').font(boldFontName).text(transliterateVietnamese('THONG TIN NGUOI LIEN QUAN'), { align: 'center' });
            doc.moveDown(1);

            // Display information for each person
            for (let i = 0; i < data.personsInfo.length; i++) {
                const person = data.personsInfo[i];

                doc.roundedRect(50, doc.y, 500, 220, 5).fillAndStroke('#f0f7ff', '#bbddff');
                doc.y += 10;

                doc.fontSize(14)
                    .fillColor('#0066cc')
                    .font(boldFontName)
                    .text(transliterateVietnamese(`NGUOI THU ${i + 1}`), 70, doc.y);
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
                doc.text(transliterateVietnamese(`Ho va ten: ${person.name}`), 70);
                doc.text(transliterateVietnamese(`Moi quan he: ${person.relationship}`), 70);
                if (person.dob) {
                    doc.text(transliterateVietnamese(`Ngay sinh: ${moment(person.dob).format('DD/MM/YYYY')}`), 70);
                }
                doc.text(transliterateVietnamese(`Noi sinh: ${person.birthPlace}`), 70);
                doc.text(transliterateVietnamese(`Quoc tich: ${person.nationality}`), 70);
                if (person.identityDocument) {
                    doc.text(transliterateVietnamese(`CMND/CCCD: ${person.identityDocument}`), 70);
                }
                doc.text(transliterateVietnamese(`Ma mau: ${person.sampleId}`), 70);

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
        doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(transliterateVietnamese('THONG TIN MAU XET NGHIEM'), 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333').font(regularFontName);
        // Display information about additional samples if available
        if (data.allSampleIds && data.allSampleIds.length > 1) {
            doc.moveDown(0.2);
            doc.text(transliterateVietnamese(`So luong mau: ${data.allSampleIds.length}`), 70);

            // Display list of sample IDs (maximum 5 samples to avoid excessive length)
            const displaySampleIds = data.allSampleIds.slice(0, 5);
            const remainingSamples = data.allSampleIds.length - 5;

            doc.text(transliterateVietnamese(`Danh sach ma mau: ${displaySampleIds.join(', ')}${remainingSamples > 0 ? ` va ${remainingSamples} mau khac` : ''}`), 70);
        }
        doc.text(transliterateVietnamese(`Loai mau: ${translateSampleType(data.sampleType)}`), 70);
        doc.text(transliterateVietnamese(`Phuong phap lay mau: ${translateCollectionMethod(data.collectionMethod)}`), 70);
        doc.text(transliterateVietnamese(`Ngay lay mau: ${moment(data.collectionDate).format('DD/MM/YYYY')}`), 70);

        doc.moveDown(1);
        doc.y += 10;

        // Add appointment information with styled section
        doc.roundedRect(50, doc.y, 500, 90, 5).fillAndStroke('#f5f0ff', '#ccbbff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(transliterateVietnamese('THONG TIN LICH HEN'), 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333').font(regularFontName);
        doc.text(transliterateVietnamese(`Ma lich hen: ${data.appointmentId}`), 70);
        doc.text(transliterateVietnamese(`Ngay hen: ${moment(data.appointmentDate).format('DD/MM/YYYY')}`), 70);
        doc.text(transliterateVietnamese(`Loai dich vu: ${translateServiceType(data.serviceType)}`), 70);
        doc.moveDown(1);
        doc.y += 10;

        // Add test results with prominent styling
        doc.addPage();

        // Add decorative line for results page
        doc.lineWidth(2).moveTo(50, 70).lineTo(550, 70).stroke('#0066cc');

        doc.fontSize(20).fillColor('#0066cc').font(boldFontName).text(transliterateVietnamese('KET QUA XET NGHIEM'), { align: 'center' });
        doc.moveDown(1);

        // Display match results prominently with improved visual indicator
        const resultBoxHeight = 60;
        const resultBoxY = doc.y;

        doc.roundedRect(150, resultBoxY, 300, resultBoxHeight, 10).fillAndStroke(data.isMatch ? '#e6ffe6' : '#ffe6e6', data.isMatch ? '#00cc00' : '#cc0000');

        doc.fontSize(18)
            .fillColor(data.isMatch ? '#006600' : '#990000')
            .font(boldFontName);
        doc.text(transliterateVietnamese(`Ket qua: ${data.isMatch ? 'KHO' : 'KHONG KHO'}`), 150, resultBoxY + 20, {
            align: 'center',
            width: 300,
        });

        doc.y = resultBoxY + resultBoxHeight + 20;

        // Add detailed results with improved formatting
        if (data.resultData) {
            doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(transliterateVietnamese('KET QUA CHI TIET:'), { underline: true });
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
                .text(transliterateVietnamese('Thong so'), 70, currentY + 8);
            doc.text(transliterateVietnamese('Gia tri'), 350, currentY + 8);
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
                    .text(transliterateVietnamese(formattedKey), 70, currentY + 6);
                doc.text(transliterateVietnamese(`${details[key]}`), 350, currentY + 6);

                currentY += 25;
            });

            // Draw border around entire table
            doc.rect(50, startY, 500, currentY - startY).stroke('#cccccc');
        }

        doc.moveDown(1.5);

        // Add laboratory technician information with styled section
        doc.roundedRect(50, doc.y, 500, 80, 5).fillAndStroke('#f0f7ff', '#bbddff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').font(boldFontName).text(transliterateVietnamese('THONG TIN PHONG XET NGHIEM'), 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333').font(regularFontName);
        doc.text(transliterateVietnamese(`Ky thuat vien: ${data.labTechnicianName}`), 70);
        doc.text(transliterateVietnamese(`Ngay hoan thanh: ${moment(data.completedAt).format('DD/MM/YYYY')}`), 70);
        doc.moveDown(1.5);

        // Administrative specific section
        if (template === 'administrative_report_template') {
            doc.addPage();
            doc.fontSize(16).fillColor('#cc0000').font(boldFontName).text(transliterateVietnamese('XAC NHAN CUA CAN BO'), { align: 'center' });
            doc.moveDown(1);
            doc.fontSize(12).fillColor('#333333').font(regularFontName).text(transliterateVietnamese('Bao cao nay duoc cap cho muc dich hanh chinh/phap ly.'), 70);
            doc.moveDown(1);
            doc.text(transliterateVietnamese('Dai dien can bo: ___________________________'), 70);
            doc.moveDown(0.5);
            doc.text(transliterateVietnamese('Chuc vu: _______________________________________'), 70);
            doc.moveDown(0.5);
            doc.text(transliterateVietnamese('Ngay: ___________________   Chu ky: ___________________'), 70);
            doc.moveDown(2);
        }

        // Add signature line with improved styling
        doc.y += 20;
        doc.fontSize(12).fillColor('#333333').font(regularFontName).text(transliterateVietnamese('Chu ky'), 70);
        doc.lineCap('butt')
            .moveTo(70, doc.y + 40)
            .lineTo(250, doc.y + 40)
            .stroke('#333333');
        doc.text(transliterateVietnamese('Ky thuat vien phong xet nghiem'), 70, doc.y + 45);

        // Add placeholder for company seal
        doc.circle(400, doc.y + 30, 40).stroke('#999999');
        doc.fontSize(10)
            .fillColor('#999999')
            .font(regularFontName)
            .text(transliterateVietnamese('Con dau'), 380, doc.y + 25);
        doc.text(transliterateVietnamese('chinh thuc'), 375, doc.y + 38);

        // Add footer with disclaimer but no page numbering
        const footerY = doc.page.height - 50;
        doc.lineWidth(0.5)
            .moveTo(50, footerY - 15)
            .lineTo(550, footerY - 15)
            .stroke('#cccccc');

        doc.fontSize(10)
            .fillColor('#666666')
            .font(regularFontName)
            .text(transliterateVietnamese('Bao cao nay duoc tao tu dong va co hieu luc ma khong can chu ky. ' + 'Ket qua can duoc giai thich boi chuyen gia y te co trinh do.'), 50, footerY, { width: 500, align: 'center' });

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
 * Helper functions to translate terms to Vietnamese (transliterated)
 */
function translateGender(gender: string): string {
    const genderMap: Record<string, string> = {
        male: 'Nam',
        female: 'Nu',
        other: 'Khac',
    };
    return transliterateVietnamese(genderMap[gender.toLowerCase()] || gender);
}

function translateSampleType(sampleType: string): string {
    const sampleTypeMap: Record<string, string> = {
        blood: 'Mau',
        urine: 'Nuoc tieu',
        hair: 'Toc',
        saliva: 'Nuoc bot',
        tissue: 'Mo',
        swab: 'Tam bong',
    };
    return transliterateVietnamese(sampleTypeMap[sampleType.toLowerCase()] || sampleType);
}

function translateCollectionMethod(method: string): string {
    const methodMap: Record<string, string> = {
        venipuncture: 'Lay mau tinh mach',
        'finger prick': 'Lay mau dau ngon tay',
        'swab collection': 'Thu thap bang tam bong',
        'clean catch': 'Thu thap sach',
        self: 'Tu thu thap',
        facility: 'Tai co so y te',
        home: 'Tai nha',
    };
    return transliterateVietnamese(methodMap[method.toLowerCase()] || method);
}

function translateServiceType(serviceType: string): string {
    const serviceTypeMap: Record<string, string> = {
        'general checkup': 'Kham tong quat',
        'blood test': 'Xet nghiem mau',
        'genetic test': 'Xet nghiem di truyen',
        'allergy test': 'Xet nghiem di ung',
        'covid test': 'Xet nghiem COVID',
        'dna test': 'Xet nghiem ADN',
        'DNA Paternity Test': 'Xet nghiem ADN xac dinh huyet thong',
        administrative: 'Xet nghiem hanh chinh',
    };
    return transliterateVietnamese(serviceTypeMap[serviceType.toLowerCase()] || serviceType);
}

function translateResultKey(key: string): string {
    // Convert snake_case to readable format and translate
    const formattedKey = key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const resultKeyMap: Record<string, string> = {
        'Blood Pressure': 'Huyet ap',
        'Heart Rate': 'Nhip tim',
        'Glucose Level': 'Muc duong huyet',
        Cholesterol: 'Cholesterol',
        Hemoglobin: 'Hemoglobin',
        'White Blood Cell Count': 'So luong bach cau',
        'Red Blood Cell Count': 'So luong hong cau',
        'Platelet Count': 'So luong tieu cau',
        'Dna Match': 'Kho ADN',
        'Match Percentage': 'Ty le kho',
        'Match Score': 'Diem kho',
        'Confidence Level': 'Muc do tin cay',
    };

    return transliterateVietnamese(resultKeyMap[formattedKey] || formattedKey);
}
