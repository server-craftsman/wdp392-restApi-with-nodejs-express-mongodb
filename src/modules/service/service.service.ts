import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { IError } from "../../core/interfaces";
import { SearchPaginationResponseModel } from "../../core/models";
import { IService, SampleMethod, ServiceType } from "./service.interface";
import ServiceSchema from "./service.model";
import CreateServiceDto from "./dtos/createService.dto";
import UpdateServiceDto from "./dtos/updateService.dto";
import { isEmptyObject } from "../../core/utils";
import { SampleMethodEnum, ServiceTypeEnum } from "./service.enum";

export default class ServiceService {
    public serviceSchema = ServiceSchema;

    public async createService(model: CreateServiceDto): Promise<IService> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        this.validateServiceData(model);

        // Tự động định nghĩa phương thức lấy mẫu dựa vào loại dịch vụ
        if (model.type === ServiceTypeEnum.CIVIL) {
            model.sample_method = SampleMethodEnum.SELF_COLLECTED;
        } else if (model.type === ServiceTypeEnum.ADMINISTRATIVE) {
            model.sample_method = SampleMethodEnum.FACILITY_COLLECTED;
        }

        // Tính toán price dựa vào business rules (nếu cần)
        this.calculateServicePrice(model);

        // Kiểm tra trùng lặp
        await this.checkDuplicateService(model);

        // Tạo dịch vụ mới
        let newService = {
            ...model,
            is_active: true, // Mặc định dịch vụ mới là active
            created_at: new Date(),
            updated_at: new Date(),
        };

        return this.serviceSchema.create(newService);
    }

    public async getServices(): Promise<IService[]> {
        return this.serviceSchema.find({ is_active: true, is_deleted: false }).sort({ created_at: -1 });
    }

    /**
     * Xác thực dữ liệu dịch vụ
     */
    private validateServiceData(model: CreateServiceDto): void {
        // Xác thực tên dịch vụ
        if (!model.name || model.name.trim() === '') {
            throw new HttpException(HttpStatus.BadRequest, 'Service name is required');
        }

        // Xác thực mô tả
        if (!model.description || model.description.trim() === '') {
            throw new HttpException(HttpStatus.BadRequest, 'Service description is required');
        }

        // Xác thực giá
        if (model.price <= 0) {
            throw new HttpException(HttpStatus.BadRequest, 'Service price must be greater than 0');
        }

        // Xác thực thời gian ước tính
        if (model.estimated_time <= 0) {
            throw new HttpException(HttpStatus.BadRequest, 'Estimated time must be greater than 0');
        }

        // Xác thực loại dịch vụ
        if (!Object.values(ServiceTypeEnum).includes(model.type as ServiceTypeEnum)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid service type');
        }

        // Xác thực phương thức lấy mẫu
        if (!Object.values(SampleMethodEnum).includes(model.sample_method as SampleMethodEnum)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid sample method');
        }
    }

    /**
     * Tính toán giá dịch vụ (thêm logic nếu cần)
     */
    private calculateServicePrice(model: CreateServiceDto): void {
        // Ví dụ: Nếu dịch vụ là xét nghiệm tại nhà, tăng giá thêm 20%
        if (model.sample_method === SampleMethodEnum.HOME_COLLECTED) {
            model.price = Math.round(model.price * 1.2);
        }

        // Ví dụ: Nếu dịch vụ hành chính có thời gian ước tính > 48h, giảm giá 10%
        if (model.type === ServiceTypeEnum.ADMINISTRATIVE && model.estimated_time > 48) {
            model.price = Math.round(model.price * 0.9);
        }
    }

    /**
     * Kiểm tra dịch vụ trùng lặp
     */
    private async checkDuplicateService(model: CreateServiceDto): Promise<void> {
        const existingService = await this.serviceSchema.findOne({ name: model.name });
        if (existingService) {
            throw new HttpException(HttpStatus.Conflict, 'Service with this name already exists');
        }
    }

    /**
     * Cập nhật dịch vụ
     */
    public async updateService(id: string, model: Partial<UpdateServiceDto>): Promise<IService> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        // Tìm dịch vụ cần cập nhật
        const service = await this.serviceSchema.findById(id);
        if (!service) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }

        // Nếu thay đổi type, cập nhật sample_method tương ứng
        if (model.type) {
            if (model.type === ServiceTypeEnum.CIVIL) {
                model.sample_method = SampleMethodEnum.SELF_COLLECTED;
            } else if (model.type === ServiceTypeEnum.ADMINISTRATIVE) {
                model.sample_method = SampleMethodEnum.FACILITY_COLLECTED;
            }
        }

        // Cập nhật giá nếu cần
        if (model.price || model.sample_method || model.type || model.estimated_time) {
            const updatedModel = {
                ...service.toObject(),
                ...model
            } as UpdateServiceDto;
            this.calculateServicePrice(updatedModel);
            model.price = updatedModel.price;
        }

        // Cập nhật dịch vụ
        const updatedService = await this.serviceSchema.findByIdAndUpdate(
            id,
            {
                ...model,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedService) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }

        return updatedService;
    }

    /**
     * Xóa dịch vụ (soft delete - chỉ vô hiệu hóa)
     */
    public async deleteService(id: string): Promise<IService> {
        const service = await this.serviceSchema.findByIdAndUpdate(
            id,
            { is_deleted: true, is_active: false, updated_at: new Date() },
            { new: true }
        );

        if (!service) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }

        return service;
    }

    /**
     * Tìm dịch vụ theo ID
     */
    public async getServiceById(id: string): Promise<IService> {
        const service = await this.serviceSchema.findById(id);
        if (!service) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }
        return service;
    }

    /**
     * Tìm kiếm dịch vụ theo loại
     */
    public async getServicesByType(type: ServiceType): Promise<IService[]> {
        return this.serviceSchema.find({ type, is_active: true });
    }

    /**
     * Lấy dịch vụ theo phương thức lấy mẫu
     */
    public async getServicesBySampleMethod(sampleMethod: SampleMethod): Promise<IService[]> {
        return this.serviceSchema.find({ sample_method: sampleMethod, is_active: true });
    }
}