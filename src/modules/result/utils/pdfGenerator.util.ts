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

// Path to default Times-Roman font available in PDFKit
// PDFKit includes these fonts: 'Courier', 'Courier-Bold', 'Courier-Oblique', 'Courier-BoldOblique',
// 'Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique',
// 'Times-Roman', 'Times-Bold', 'Times-Italic', 'Times-BoldItalic'

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
}

/**
 * Generate a PDF report for a test result in Vietnamese
 */
export async function generateTestResultPDF(data: TestResultReportData, template?: string): Promise<string> {
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
        // Create PDF document with improved margins for professional presentation
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Test Results Report - ${data.resultId}`,
                Author: 'Healthcare System',
                Subject: 'Medical Test Results',
                Keywords: 'test, medical, results'
            },
            autoFirstPage: true
        });
        const writeStream = fs.createWriteStream(tempFilePath);

        // Pipe the PDF to the file
        doc.pipe(writeStream);

        // === ADMINISTRATIVE PDF CUSTOMIZATION ===
        if (template === 'administrative_report_template') {
            // Watermark
            doc.fontSize(60).fillColor('#eeeeee').opacity(0.3).text('ADMINISTRATIVE', 100, 300);
            doc.opacity(1);
            // Header
            doc.fontSize(18).fillColor('#cc0000').text('ADMINISTRATIVE DNA TEST REPORT', { align: 'center' });
            doc.moveDown(0.5);
            // Số hiệu vụ việc
            if ((data as any).caseNumber) {
                doc.fontSize(12).fillColor('#333333').text(`Case Number: ${(data as any).caseNumber}`, { align: 'right' });
            }
            // Thêm section xác nhận của cơ quan
            doc.moveDown(2);
        } else {
            // Add decorative line for header
            doc.lineWidth(1)
                .moveTo(50, 110)
                .lineTo(550, 110)
                .stroke('#0066cc');
            // Add header with better styling - using ASCII instead of Unicode
            doc.fontSize(22).fillColor('#0066cc').text('TEST RESULTS REPORT', { align: 'center' });
            doc.moveDown(0.5);
        }

        // Add report identification with improved formatting - using ASCII instead of Unicode
        const dateStr = moment().locale('vi').format('DD/MM/YYYY');
        doc.fontSize(11).fillColor('#666666').text(`Report ID: ${data.resultId}`, { align: 'right' });
        doc.text(`Date created: ${dateStr}`, { align: 'right' });
        doc.moveDown(2);

        // Add customer information with better styling
        doc.roundedRect(50, doc.y, 500, 140, 5).fillAndStroke('#f6f6f6', '#dddddd');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').text('CUSTOMER INFORMATION', 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333');
        doc.text(`Full name: ${convertToASCII(data.customerName)}`, 70);
        doc.text(`Gender: ${convertToASCII(translateGender(data.customerGender))}`);
        doc.text(`Date of birth: ${moment(data.customerDateOfBirth).format('DD/MM/YYYY')}`);
        doc.text(`Phone: ${data.customerContactInfo.phone}`);
        doc.text(`Email: ${data.customerContactInfo.email}`);
        doc.text(`Address: ${data.customerContactInfo.address}`);
        doc.moveDown(1);
        doc.y += 10;

        // Display information about persons related to the sample if available
        if (data.personsInfo && data.personsInfo.length > 0) {
            doc.addPage();
            doc.fontSize(18).fillColor('#0066cc').text('RELATED PERSONS INFORMATION', { align: 'center' });
            doc.moveDown(1);

            // Display information for each person
            for (let i = 0; i < data.personsInfo.length; i++) {
                const person = data.personsInfo[i];

                doc.roundedRect(50, doc.y, 500, 220, 5).fillAndStroke('#f0f7ff', '#bbddff');
                doc.y += 10;

                doc.fontSize(14).fillColor('#0066cc').text(`PERSON ${i + 1}`, 70, doc.y);
                doc.moveDown(0.2);

                // Add person image if available
                if (person.imageUrl) {
                    try {
                        // Download the image from the URL
                        const response = await axios.get(person.imageUrl, {
                            responseType: 'arraybuffer'
                        });

                        // Create a buffer from the response data
                        const imageBuffer = Buffer.from(response.data, 'binary');

                        // Calculate image position (right side of the person info)
                        const imageX = 400;
                        const imageY = doc.y;

                        // Add the image to the PDF with a maximum width/height of 100px
                        doc.image(imageBuffer, imageX, imageY, {
                            fit: [100, 100],
                            align: 'right'
                        });
                    } catch (error) {
                        console.error(`Error adding person image for ${person.name}:`, error);
                        // Continue without the image if there's an error
                    }
                }

                doc.fontSize(10).fillColor('#333333');
                doc.text(`Full name: ${person.name}`, 70);
                doc.text(`Relationship: ${convertToASCII(person.relationship)}`);
                if (person.dob) {
                    doc.text(`Date of birth: ${moment(person.dob).format('DD/MM/YYYY')}`);
                }
                doc.text(`Place of birth: ${convertToASCII(person.birthPlace)}`);
                doc.text(`Nationality: ${convertToASCII(person.nationality)}`);
                if (person.identityDocument) {
                    doc.text(`Identity document: ${person.identityDocument}`);
                }
                doc.text(`Sample ID: ${person.sampleId}`);

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
        doc.fontSize(16).fillColor('#0066cc').text('SAMPLE INFORMATION', 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333');
        // Display information about additional samples if available
        if (data.allSampleIds && data.allSampleIds.length > 1) {
            doc.moveDown(0.2);
            doc.text(`Number of samples: ${data.allSampleIds.length}`, 70);

            // Display list of sample IDs (maximum 5 samples to avoid excessive length)
            const displaySampleIds = data.allSampleIds.slice(0, 5);
            const remainingSamples = data.allSampleIds.length - 5;

            doc.text(`Sample ID list: ${displaySampleIds.join(', ')}${remainingSamples > 0 ? ` and ${remainingSamples} other samples` : ''}`, 70);
        }
        doc.text(`Sample type: ${convertToASCII(translateSampleType(data.sampleType))}`);
        doc.text(`Collection method: ${convertToASCII(translateCollectionMethod(data.collectionMethod))}`);
        doc.text(`Collection date: ${moment(data.collectionDate).format('DD/MM/YYYY')}`);

        doc.moveDown(1);
        doc.y += 10;

        // Add appointment information with styled section
        doc.roundedRect(50, doc.y, 500, 90, 5).fillAndStroke('#f5f0ff', '#ccbbff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').text('APPOINTMENT INFORMATION', 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333');
        doc.text(`Appointment ID: ${data.appointmentId}`, 70);
        doc.text(`Appointment date: ${moment(data.appointmentDate).format('DD/MM/YYYY')}`);
        doc.text(`Service type: ${convertToASCII(translateServiceType(data.serviceType))}`);
        doc.moveDown(1);
        doc.y += 10;

        // Add test results with prominent styling
        doc.addPage();

        // Add decorative line for results page
        doc.lineWidth(2)
            .moveTo(50, 70)
            .lineTo(550, 70)
            .stroke('#0066cc');

        doc.fontSize(20).fillColor('#0066cc').text('TEST RESULTS', { align: 'center' });
        doc.moveDown(1);

        // Display match results prominently with improved visual indicator
        const resultBoxHeight = 60;
        const resultBoxY = doc.y;

        doc.roundedRect(150, resultBoxY, 300, resultBoxHeight, 10)
            .fillAndStroke(data.isMatch ? '#e6ffe6' : '#ffe6e6', data.isMatch ? '#00cc00' : '#cc0000');

        doc.fontSize(18).fillColor(data.isMatch ? '#006600' : '#990000');
        doc.text(`Result: ${data.isMatch ? 'MATCH' : 'NO MATCH'}`, 150, resultBoxY + 20, {
            align: 'center',
            width: 300
        });

        doc.y = resultBoxY + resultBoxHeight + 20;

        // Add detailed results with improved formatting
        if (data.resultData) {
            doc.fontSize(16).fillColor('#0066cc').text('Detailed test results:', { underline: true });
            doc.moveDown(0.5);

            // Get keys from result data
            const details = data.resultData;
            const keys = Object.keys(details);

            // Create table-like structure for results
            const startY = doc.y;
            let currentY = startY;

            // Draw table header
            doc.rect(50, currentY, 500, 30).fillAndStroke('#0066cc', '#0066cc');
            doc.fillColor('#ffffff').fontSize(14).text('Parameter', 70, currentY + 8);
            doc.text('Value', 350, currentY + 8);
            currentY += 30;

            // Add each result data point in alternating color rows
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

            // Draw border around entire table
            doc.rect(50, startY, 500, currentY - startY).stroke('#cccccc');
        }

        doc.moveDown(1.5);

        // Add laboratory technician information with styled section
        doc.roundedRect(50, doc.y, 500, 80, 5).fillAndStroke('#f0f7ff', '#bbddff');
        doc.y += 10;
        doc.fontSize(16).fillColor('#0066cc').text('LABORATORY INFORMATION', 70, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#333333');
        doc.text(`Laboratory technician: ${data.labTechnicianName}`, 70);
        doc.text(`Completion date: ${moment(data.completedAt).format('DD/MM/YYYY')}`);
        doc.moveDown(1.5);

        // Add signature line with improved styling
        doc.y += 20;
        doc.fontSize(12).fillColor('#333333').text('Signature', 70);
        doc.lineCap('butt')
            .moveTo(70, doc.y + 40)
            .lineTo(250, doc.y + 40)
            .stroke('#333333');
        doc.text('Laboratory technician', 70, doc.y + 45);

        // Add placeholder for company seal
        doc.circle(400, doc.y + 30, 40).stroke('#999999');
        doc.fontSize(10).fillColor('#999999').text('Official', 380, doc.y + 25);
        doc.text('seal', 385, doc.y + 38);

        // Add footer with disclaimer but no page numbering
        const footerY = doc.page.height - 50;
        doc.lineWidth(0.5)
            .moveTo(50, footerY - 15)
            .lineTo(550, footerY - 15)
            .stroke('#cccccc');

        doc.fontSize(10).fillColor('#666666').text(
            'This report is automatically generated and valid without signature. ' +
            'Results should be interpreted by qualified medical professionals.',
            50, footerY, { width: 500, align: 'center' }
        );

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

            // Cuối file, nếu là ADMINISTRATIVE, thêm section xác nhận của cơ quan
            if (template === 'administrative_report_template') {
                doc.addPage();
                doc.fontSize(14).fillColor('#cc0000').text('AGENCY CONFIRMATION', { align: 'center' });
                doc.moveDown(1);
                doc.fontSize(12).fillColor('#333333').text('This report is issued for administrative/legal purposes.');
                doc.moveDown(1);
                doc.text('Agency Representative: ___________________________');
                doc.moveDown(0.5);
                doc.text('Position: _______________________________________');
                doc.moveDown(0.5);
                doc.text('Date: ___________________   Signature: ___________________');
            }

            return uploadResult.Location;
        } catch (error: any) {
            throw new HttpException(
                HttpStatus.InternalServerError,
                `Error processing PDF: ${error.message}`
            );
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
        throw new HttpException(
            HttpStatus.InternalServerError,
            `Failed to generate or upload PDF report: ${error.message}`
        );
    }
}

/**
 * Function to convert Vietnamese Unicode characters to ASCII
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
 * Helper functions to translate terms to Vietnamese
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
    // Convert snake_case to readable format and translate
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