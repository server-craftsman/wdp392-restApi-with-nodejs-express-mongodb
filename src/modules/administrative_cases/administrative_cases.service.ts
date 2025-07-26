import AdministrativeCaseSchema from './administrative_cases.model';
import { IAdministrativeCase } from './administrative_cases.interface';
import { AdministrativeCaseStatus, AdministrativeCaseType, CaseUrgency } from './administrative_cases.enum';
import UserSchema from '../user/user.model';
import { UserRoleEnum } from '../user';
import { CreateAdministrativeCaseDto, UpdateAdministrativeCaseDto } from './dtos/commonAdminCases.dto';
import { validateOrReject } from 'class-validator';
import mongoose from 'mongoose';

export default class AdministrativeCasesService {
    public async createCase(data: CreateAdministrativeCaseDto, userId: string): Promise<IAdministrativeCase> {
        const user = await UserSchema.findById(userId).lean();
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== UserRoleEnum.ADMIN && user.role !== UserRoleEnum.MANAGER) {
            throw new Error('Only ADMIN or MANAGER can create administrative case');
        }

        // Validate DTO
        await validateOrReject(data);

        // Generate case number if not provided
        if (!data.case_number) {
            data.case_number = this.generateCaseNumber();
        }

        // Check if case number already exists
        const existingCase = await AdministrativeCaseSchema.findOne({
            case_number: data.case_number,
            is_deleted: false,
        });
        if (existingCase) {
            throw new Error(`Case number ${data.case_number} already exists`);
        }

        // Set up case data with new structure
        const caseData: any = { ...data };
        caseData.created_by_user_id = userId;
        caseData.status = AdministrativeCaseStatus.DRAFT;
        caseData.created_at = new Date();
        caseData.updated_at = new Date();
        caseData.is_deleted = false;

        return AdministrativeCaseSchema.create(caseData);
    }

    public async getCaseById(id: string): Promise<IAdministrativeCase | null> {
        return AdministrativeCaseSchema.findById(id).populate('created_by_user_id', 'email first_name last_name role').populate('assigned_staff_id', 'email first_name last_name role');
    }

    // Alias for consistency with other services
    public async getAdministrativeCaseById(id: string): Promise<IAdministrativeCase | null> {
        return this.getCaseById(id);
    }

    public async updateCase(id: string, data: UpdateAdministrativeCaseDto): Promise<IAdministrativeCase | null> {
        if (data.is_deleted) {
            throw new Error('Cannot update deleted case');
        }

        const existingCase = await AdministrativeCaseSchema.findById(id);
        if (!existingCase) {
            throw new Error('Case not found');
        }
        if (existingCase.is_deleted) {
            throw new Error('Cannot update deleted case');
        }

        // Validate assigned_staff_id is a valid staff
        if (data.assigned_staff_id !== undefined) {
            if (data.assigned_staff_id === null || data.assigned_staff_id === '') {
                // Allow clearing the assignment by setting to null or empty string
                data.assigned_staff_id = null;
            } else if (typeof data.assigned_staff_id === 'string' && data.assigned_staff_id.trim() !== '') {
                // Validate that the staff ID is a valid ObjectId format
                if (!/^[0-9a-fA-F]{24}$/.test(data.assigned_staff_id)) {
                    throw new Error('Invalid staff ID format. Staff ID must be a valid 24-character hexadecimal string.');
                }

                // Try to find the staff member, but don't fail if not found
                const staff = await UserSchema.findById(data.assigned_staff_id);
                if (staff) {
                    if (staff.role !== UserRoleEnum.STAFF) {
                        throw new Error(`User with ID ${data.assigned_staff_id} (${staff.email}) is not a staff member. Only users with STAFF role can be assigned to cases.`);
                    }
                } else {
                    console.log(`Warning: Staff member with ID ${data.assigned_staff_id} not found, but allowing assignment anyway`);
                }
            } else {
                throw new Error('assigned_staff_id must be a valid string or null');
            }
        }

        // Validate DTO if provided
        if (Object.keys(data).length > 0) {
            await validateOrReject(data);
        }

        // Create update object with timestamp
        const updateData: any = { ...data, updated_at: new Date() };

        // Convert assigned_staff_id to ObjectId for database operation if it's a string
        if (updateData.assigned_staff_id && typeof updateData.assigned_staff_id === 'string') {
            updateData.assigned_staff_id = new mongoose.Types.ObjectId(updateData.assigned_staff_id);
        }

        // Use $set operator explicitly to ensure all fields are updated
        const updateQuery = { $set: updateData };

        // Perform the update and get the result
        const result = await AdministrativeCaseSchema.findByIdAndUpdate(id, updateQuery, { new: true }).populate('created_by_user_id', 'email first_name last_name role').populate('assigned_staff_id', 'email first_name last_name role');

        return result;
    }

    public async updateCaseStatus(id: string, status: string): Promise<IAdministrativeCase | null> {
        const updateData: any = { status, updated_at: new Date() };

        // Set timestamps based on status
        switch (status) {
            case AdministrativeCaseStatus.SUBMITTED:
                updateData.submitted_at = new Date();
                break;
            case AdministrativeCaseStatus.UNDER_REVIEW:
                updateData.reviewed_at = new Date();
                break;
            case AdministrativeCaseStatus.APPROVED:
                updateData.approved_at = new Date();
                break;
            case AdministrativeCaseStatus.SCHEDULED:
                updateData.scheduled_at = new Date();
                break;
            case AdministrativeCaseStatus.COMPLETED:
                updateData.completed_at = new Date();
                break;
        }

        return AdministrativeCaseSchema.findByIdAndUpdate(id, updateData, { new: true });
    }

    public async addAppointmentToCase(caseId: string, appointmentId: string): Promise<IAdministrativeCase | null> {
        return AdministrativeCaseSchema.findByIdAndUpdate(
            caseId,
            {
                $push: { appointment_ids: appointmentId },
                status: AdministrativeCaseStatus.SCHEDULED,
                scheduled_at: new Date(),
                updated_at: new Date(),
            },
            { new: true },
        );
    }

    public async deleteCase(id: string): Promise<IAdministrativeCase | null> {
        return AdministrativeCaseSchema.findByIdAndUpdate(id, { is_deleted: true, updated_at: new Date() }, { new: true });
    }

    public async listCases(query: any): Promise<IAdministrativeCase[]> {
        // Add default filter for non-deleted cases
        const searchQuery = {
            ...query,
            is_deleted: { $ne: true },
        };

        return AdministrativeCaseSchema.find(searchQuery).populate('created_by_user_id', 'email first_name last_name role').populate('assigned_staff_id', 'email first_name last_name role').sort({ created_at: -1 }); // Sort by newest first
    }

    /**
     * Generate unique case number in format PL-YYYY-XXX
     * PL = Pháp Lý, YYYY = year, XXX = sequential number
     */
    public generateCaseNumber(): string {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-3); // Use last 3 digits of timestamp
        return `PL-${year}-${timestamp.padStart(3, '0')}`;
    }

    /**
     * Generate unique case number with proper sequence
     */
    public async generateSequentialCaseNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const yearPrefix = `PL-${year}-`;

        // Find the highest case number for current year
        const latestCase = await AdministrativeCaseSchema.findOne({
            case_number: { $regex: `^${yearPrefix}` },
        }).sort({ case_number: -1 });

        let nextNumber = 1;
        if (latestCase && latestCase.case_number) {
            const lastNumber = parseInt(latestCase.case_number.split('-')[2]);
            nextNumber = lastNumber + 1;
        }

        return `${yearPrefix}${nextNumber.toString().padStart(3, '0')}`;
    }

    /**
     * Get cases by status
     */
    public async getCasesByStatus(status: string): Promise<IAdministrativeCase[]> {
        return this.listCases({ status });
    }

    /**
     * Assign staff to case
     */
    public async assignStaff(caseId: string, staffId: string): Promise<IAdministrativeCase | null> {
        return this.updateCase(caseId, { assigned_staff_id: staffId });
    }

    /**
     * Get cases by case number
     */
    public async getCaseByCaseNumber(caseNumber: string): Promise<IAdministrativeCase | null> {
        return AdministrativeCaseSchema.findOne({
            case_number: caseNumber,
            is_deleted: { $ne: true },
        })
            .populate('created_by_user_id', 'email first_name last_name role')
            .populate('assigned_staff_id', 'email first_name last_name role');
    }

    /**
     * Search cases by multiple criteria
     */
    public async searchCases(searchParams: {
        case_number?: string;
        case_type?: string;
        status?: string;
        requesting_agency?: string;
        agency_contact_email?: string;
        created_by_user_id?: string;
        assigned_staff_id?: string;
        from_date?: Date;
        to_date?: Date;
    }): Promise<IAdministrativeCase[]> {
        const query: any = { is_deleted: { $ne: true } };

        if (searchParams.case_number) {
            query.case_number = { $regex: searchParams.case_number, $options: 'i' };
        }
        if (searchParams.case_type) {
            query.case_type = searchParams.case_type;
        }
        if (searchParams.status) {
            query.status = searchParams.status;
        }
        if (searchParams.requesting_agency) {
            query.requesting_agency = { $regex: searchParams.requesting_agency, $options: 'i' };
        }
        if (searchParams.agency_contact_email) {
            query.agency_contact_email = searchParams.agency_contact_email;
        }
        if (searchParams.created_by_user_id) {
            query.created_by_user_id = searchParams.created_by_user_id;
        }
        if (searchParams.assigned_staff_id) {
            query.assigned_staff_id = searchParams.assigned_staff_id;
        }
        if (searchParams.from_date || searchParams.to_date) {
            query.created_at = {};
            if (searchParams.from_date) {
                query.created_at.$gte = searchParams.from_date;
            }
            if (searchParams.to_date) {
                query.created_at.$lte = searchParams.to_date;
            }
        }

        return this.listCases(query);
    }

    /**
     * Get assigned cases for staff/labtech with limited case types
     * Staff/LabTech can only see cases assigned to them and specific case types
     */
    public async getAssignedCasesForStaff(staffId: string, userRole: string): Promise<IAdministrativeCase[]> {
        // Define allowed case types for staff/labtech
        const allowedCaseTypes = [
            AdministrativeCaseType.PATERNITY,      // Xác định cha con
            AdministrativeCaseType.MATERNITY,      // Xác định mẹ con
            AdministrativeCaseType.SIBLING,        // Xác định anh chị em
            AdministrativeCaseType.KINSHIP,        // Xác định họ hàng
            AdministrativeCaseType.IMMIGRATION,    // Nhập cư
            AdministrativeCaseType.INHERITANCE,    // Thừa kế
        ];

        // Build query for assigned cases
        const query: any = {
            is_deleted: { $ne: true },
            assigned_staff_id: staffId,
            case_type: { $in: allowedCaseTypes }
        };

        // Add status filter to show only relevant cases
        const allowedStatuses = [
            AdministrativeCaseStatus.SUBMITTED,      // Đã nộp hồ sơ
            AdministrativeCaseStatus.UNDER_REVIEW,   // Đang xem xét
            AdministrativeCaseStatus.APPROVED,       // Được phê duyệt
            AdministrativeCaseStatus.SCHEDULED,      // Đã đặt lịch
            AdministrativeCaseStatus.IN_PROGRESS,    // Đang thực hiện
            AdministrativeCaseStatus.COMPLETED,      // Hoàn thành
        ];
        query.status = { $in: allowedStatuses };

        return AdministrativeCaseSchema.find(query)
            .populate('created_by_user_id', 'email first_name last_name role')
            .populate('assigned_staff_id', 'email first_name last_name role')
            .sort({ created_at: -1 });
    }

    /**
     * Get assigned cases for staff/labtech with search functionality
     */
    public async searchAssignedCasesForStaff(
        staffId: string,
        searchParams: {
            case_number?: string;
            case_type?: string;
            status?: string;
            requesting_agency?: string;
            from_date?: Date;
            to_date?: Date;
        }
    ): Promise<IAdministrativeCase[]> {
        // Define allowed case types for staff/labtech
        const allowedCaseTypes = [
            AdministrativeCaseType.PATERNITY,      // Xác định cha con
            AdministrativeCaseType.MATERNITY,      // Xác định mẹ con
            AdministrativeCaseType.SIBLING,        // Xác định anh chị em
            AdministrativeCaseType.KINSHIP,        // Xác định họ hàng
            AdministrativeCaseType.IMMIGRATION,    // Nhập cư
            AdministrativeCaseType.INHERITANCE,    // Thừa kế
        ];

        // Build query for assigned cases
        const query: any = {
            is_deleted: { $ne: true },
            assigned_staff_id: staffId,
            case_type: { $in: allowedCaseTypes }
        };

        // Add search filters
        if (searchParams.case_number) {
            query.case_number = { $regex: searchParams.case_number, $options: 'i' };
        }
        if (searchParams.case_type && allowedCaseTypes.includes(searchParams.case_type as AdministrativeCaseType)) {
            query.case_type = searchParams.case_type as AdministrativeCaseType;
        }
        if (searchParams.status) {
            query.status = searchParams.status as AdministrativeCaseStatus;
        }
        if (searchParams.requesting_agency) {
            query.requesting_agency = { $regex: searchParams.requesting_agency, $options: 'i' };
        }
        if (searchParams.from_date || searchParams.to_date) {
            query.created_at = {};
            if (searchParams.from_date) {
                query.created_at.$gte = searchParams.from_date;
            }
            if (searchParams.to_date) {
                query.created_at.$lte = searchParams.to_date;
            }
        }

        return AdministrativeCaseSchema.find(query)
            .populate('created_by_user_id', 'email first_name last_name role')
            .populate('assigned_staff_id', 'email first_name last_name role')
            .sort({ created_at: -1 });
    }

    /**
     * Get available staff members for assignment
     */
    public async getAvailableStaffMembers(): Promise<any[]> {
        const staffMembers = await UserSchema.find({
            role: UserRoleEnum.STAFF,
            is_deleted: { $ne: true }
        }).select('_id email first_name last_name role');

        return staffMembers.map(staff => ({
            id: staff._id,
            email: staff.email,
            first_name: staff.first_name,
            last_name: staff.last_name,
            role: staff.role,
            full_name: `${staff.first_name} ${staff.last_name}`.trim()
        }));
    }
}
