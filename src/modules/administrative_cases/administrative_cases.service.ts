import { AdministrativeCaseSchema } from './administrative_cases.model';
import { IAdministrativeCase } from './administrative_cases.interface';
import { AdministrativeCaseStatus } from './administrative_cases.enum';
import UserSchema from '../user/user.model';
import { UserRoleEnum } from '../user';
import { CreateAdministrativeCaseDto } from './dtos/commonAdminCases.dto';
import { validateOrReject } from 'class-validator';

export default class AdministrativeCasesService {
    public async createCase(data: Partial<IAdministrativeCase>, userId: string): Promise<IAdministrativeCase> {
        const user = await UserSchema.findById(userId).lean();
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== UserRoleEnum.ADMIN && user.role !== UserRoleEnum.MANAGER) {
            throw new Error('Only ADMIN or MANAGER can create administrative case');
        }

        // Always override applicant fields from user
        const caseData: any = { ...data };
        caseData.applicant_name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
        caseData.applicant_email = user.email;
        caseData.applicant_id = user._id?.toString?.() ?? userId;
        caseData.status = AdministrativeCaseStatus.PENDING;

        // Validate using DTO
        const dto = Object.assign(new CreateAdministrativeCaseDto(), caseData);
        await validateOrReject(dto);

        return AdministrativeCaseSchema.create({ ...caseData });
    }

    public async getCaseById(id: string): Promise<IAdministrativeCase | null> {
        return AdministrativeCaseSchema.findById(id).populate('applicant_id', 'email first_name last_name role');
    }

    public async updateCase(id: string, data: Partial<IAdministrativeCase>): Promise<IAdministrativeCase | null> {
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
        if (data.applicant_id) {
            const user = await UserSchema.findById(data.applicant_id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.role !== UserRoleEnum.ADMIN && user.role !== UserRoleEnum.MANAGER) {
                throw new Error('Only ADMIN or MANAGER can be applicant');
            }
            data.applicant_name = user.first_name + ' ' + user.last_name;
            data.applicant_email = user.email;
        }
        if (data.agency_contact_email) {
            data.agency_contact_email = data.agency_contact_email.toLowerCase();
        }
        if (data.applicant_email) {
            data.applicant_email = data.applicant_email.toLowerCase();
        }
        data.updated_at = new Date();

        // Validate using DTO (merge with existing for full object)
        const merged = { ...existingCase.toObject(), ...data };
        const dto = Object.assign(new CreateAdministrativeCaseDto(), merged);
        await validateOrReject(dto);
        return AdministrativeCaseSchema.findByIdAndUpdate(id, data, { new: true }).populate('applicant_id', 'email first_name last_name role');
    }

    public async deleteCase(id: string): Promise<IAdministrativeCase | null> {
        return AdministrativeCaseSchema.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        );
    }

    public async listCases(query: any): Promise<IAdministrativeCase[]> {
        return AdministrativeCaseSchema.find(query).populate('applicant_id', 'email first_name last_name role');
    }
}
