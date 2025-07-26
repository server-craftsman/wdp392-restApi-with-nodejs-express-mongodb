import UserService from '../../user/user.service';
import ServiceService from '../../service/service.service';
import { TestResultReportData } from '../utils/pdfGenerator.util';
import ResultRepository from '../result.repository';
import { IResult } from '../result.interface';
import mongoose from 'mongoose';
import { HttpException } from '../../../core/exceptions';
import { HttpStatus } from '../../../core/enums';
import AdministrativeCasesService from '../../administrative_cases/administrative_cases.service';

export default class ReportGeneratorService {
    private sampleService?: any;
    private appointmentService?: any;
    private serviceService = new ServiceService();
    private userService = new UserService();
    private resultRepository = new ResultRepository();
    private administrativeCasesService = new AdministrativeCasesService();



    /**
     * Lazy load SampleService to avoid circular dependency
     */
    private getSampleService(): any {
        if (!this.sampleService) {
            const { SampleService } = require('../../sample');
            this.sampleService = new SampleService();
        }
        return this.sampleService;
    }

    /**
     * Lazy load AppointmentService to avoid circular dependency
     */
    private getAppointmentService(): any {
        if (!this.appointmentService) {
            const { AppointmentService } = require('../../appointment');
            this.appointmentService = new AppointmentService();
        }
        return this.appointmentService;
    }

    /**
     * Collect all data needed for the test result report
     */
    public async collectReportData(resultId: string, labTechnicianId: string): Promise<TestResultReportData> {
        // Validate resultId
        if (!mongoose.Types.ObjectId.isValid(resultId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid result ID');
        }

        // Get the result
        const result = await this.resultRepository.findById(resultId);
        if (!result) {
            throw new HttpException(HttpStatus.NotFound, 'Result not found');
        }

        // Check if there are any samples
        if (!result.sample_ids || result.sample_ids.length === 0) {
            throw new HttpException(HttpStatus.BadRequest, 'No samples associated with this result');
        }

        // Get all samples with their data
        const samples = [];
        const sampleIds = result.sample_ids.map(id => id.toString());

        for (const sampleId of sampleIds) {
            const sample = await this.getSampleService().getSampleById(sampleId);
            if (sample) {
                samples.push(sample);
            }
        }

        if (samples.length === 0) {
            throw new HttpException(HttpStatus.NotFound, 'No samples found');
        }

        // Get primary sample data (using the first sample for basic report data)
        const primarySample = samples[0];

        // Get appointment data
        const appointment = await this.getAppointmentService().getAppointmentById(result.appointment_id?.toString() || '');
        if (!appointment) {
            throw new HttpException(HttpStatus.NotFound, 'Appointment not found');
        }

        // Get customer data
        const customer = await this.userService.getUserById(result.customer_id?.toString() || '');
        if (!customer) {
            throw new HttpException(HttpStatus.NotFound, 'Customer not found');
        }

        // Get lab technician data
        const labTechnician = await this.userService.getUserById(labTechnicianId);
        if (!labTechnician) {
            throw new HttpException(HttpStatus.NotFound, 'Laboratory technician not found');
        }

        // Get service data
        let serviceName = 'Unknown Service';

        try {
            if (appointment.service_id) {
                // Extract the service ID properly from the appointment
                let serviceId: string;

                // Handle different possible formats of service_id
                if (typeof appointment.service_id === 'object') {
                    if (appointment.service_id && (appointment.service_id as any)._id) {
                        serviceId = (appointment.service_id as any)._id.toString();
                    } else {
                        serviceId = (appointment.service_id as any).toString();
                    }
                } else {
                    serviceId = (appointment.service_id as any).toString();
                }

                // Now get the service with the extracted ID
                if (mongoose.Types.ObjectId.isValid(serviceId)) {
                    const service = await this.serviceService.getServiceById(serviceId);
                    if (service && service.name) {
                        serviceName = service.name;
                    }
                }
            }
        } catch (error) {
            console.error('Error getting service data:', error);
            // Continue with unknown service name
        }

        // Compile person information from samples
        const personsInfo = samples
            .filter(sample => sample.person_info)
            .map(sample => ({
                name: sample.person_info?.name || 'Unknown',
                relationship: sample.person_info?.relationship || 'Unknown',
                dob: sample.person_info?.dob || null,
                birthPlace: sample.person_info?.birth_place || 'Unknown',
                nationality: sample.person_info?.nationality || 'Unknown',
                identityDocument: sample.person_info?.identity_document || 'Unknown',
                sampleId: sample._id.toString(),
                imageUrl: sample.person_info?.image_url
            }));

        // Get administrative case information if applicable
        let adminCaseData = {};
        if (appointment.administrative_case_id) {
            try {
                const adminCase = await this.administrativeCasesService.getAdministrativeCaseById(appointment.administrative_case_id);

                if (adminCase) {
                    adminCaseData = {
                        caseNumber: adminCase.case_number,
                        agencyName: adminCase.requesting_agency,
                        agencyContact: adminCase.agency_contact_name
                    };
                }
            } catch (error) {
                console.error('Error fetching administrative case for report:', error);
            }
        }

        // Compile all data
        const reportData: TestResultReportData = {
            // Result data
            resultId: result._id.toString(),
            isMatch: result.is_match,
            resultData: result.result_data,
            completedAt: result.completed_at || new Date(),

            // Sample data
            sampleId: primarySample._id.toString(),
            sampleType: primarySample.type || 'Unknown',
            collectionMethod: primarySample.collection_method || 'Unknown',
            collectionDate: primarySample.collection_date || new Date(),

            // Additional data for multiple samples
            allSampleIds: sampleIds,
            personsInfo: personsInfo.length > 0 ? personsInfo : undefined,

            // Appointment data
            appointmentId: appointment._id.toString(),
            appointmentDate: appointment.appointment_date,
            serviceType: serviceName,

            // Customer data
            customerId: customer._id.toString(),
            customerName: `${customer.first_name} ${customer.last_name}`,
            customerGender: customer.gender || 'Not specified',
            customerDateOfBirth: customer.dob || new Date(),
            customerContactInfo: {
                email: customer.email || 'Not provided',
                phone: customer.phone_number || 'Not provided',
                address: typeof customer.address === 'string'
                    ? customer.address
                    : customer.address
                        ? JSON.stringify(customer.address)
                        : 'Not provided'
            },

            // Laboratory technician data
            labTechnicianId: labTechnician._id.toString(),
            labTechnicianName: `${labTechnician.first_name} ${labTechnician.last_name}`,

            // Administrative case data
            ...adminCaseData
        };

        return reportData;
    }

    /**
     * Generate a PDF report for a test result using the PDF generator
     * @param resultId ID of the result to generate a report for
     * @param labTechnicianId ID of the laboratory technician generating the report
     * @returns URL of the generated PDF
     */
    public async generateReport(resultId: string, labTechnicianId: string, reportTemplate?: string): Promise<string> {
        try {
            // Import the PDF generator dynamically to avoid circular dependencies
            const { generateTestResultPDF } = await import('../utils/pdfGenerator.util');

            // Collect all necessary data
            const reportData = await this.collectReportData(resultId, labTechnicianId);

            // Generate the PDF and get the URL
            const pdfUrl = await generateTestResultPDF(reportData, reportTemplate);

            // Update the result with the report URL
            await this.resultRepository.findByIdAndUpdate(
                resultId,
                { report_url: pdfUrl, updated_at: new Date() },
                { new: true }
            );

            return pdfUrl;
        } catch (error) {
            console.error('Failed to generate report:', error);
            throw new HttpException(
                HttpStatus.InternalServerError,
                'Failed to generate PDF report'
            );
        }
    }
} 