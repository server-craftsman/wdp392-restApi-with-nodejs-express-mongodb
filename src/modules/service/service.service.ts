import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { SearchPaginationResponseModel } from "../../core/models";
import { IService, SampleMethod, ServiceType } from "./service.interface";
import CreateServiceDto from "./dtos/createService.dto";
import UpdateServiceDto from "./dtos/updateService.dto";
import { isEmptyObject } from "../../core/utils";
import { SampleMethodEnum, ServiceTypeEnum } from "./service.enum";
import AppointmentSchema from '../appointment/appointment.model';
import ServiceRepository from './service.repository';
import { uploadFileToS3 } from "../../core/utils/s3Upload";
import { s3Folders } from "../../core/utils/aws.config";

export default class ServiceService {
    private appointmentSchema = AppointmentSchema;
    private serviceRepository = new ServiceRepository();

    /**
     * Generate a slug from a string
     * @param name The string to generate a slug from
     * @returns A URL-friendly slug
     */
    /**
     * Generate a slug from a string
     * @param name The string to generate a slug from
     * @returns A URL-friendly slug
     */
    private generateSlug(name: string): string {
        if (!name) return '';

        // First normalize Vietnamese characters
        let slug = name
            .toLowerCase()
            .trim()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/đ/g, 'd');

        // Then handle spaces and special characters
        slug = slug
            .replace(/[^\w\s-]/g, '') // Xóa các ký tự không phải là từ ngoại trừ khoảng trắng và dấu gạch nối
            .replace(/[\s_]+/g, '-') // Thay thế khoảng trắng và dấu gạch dưới bằng dấu gạch nối
            .replace(/-+/g, '-') // Xóa các dấu gạch nối liên tiếp
            .replace(/^-+|-+$/g, ''); // Xóa các dấu gạch nối ở đầu và cuối chuỗi

        return slug;
    }

    /**
     * Ensure a slug is unique by adding a suffix if necessary
     * @param baseSlug The base slug to check
     * @returns A unique slug
     */
    private async ensureUniqueSlug(baseSlug: string): Promise<string> {
        if (!baseSlug) return '';

        let slug = baseSlug;
        let counter = 1;
        let existingService = await this.serviceRepository.findOne({ slug, is_deleted: false });

        // Keep checking and incrementing counter until we find a unique slug
        while (existingService) {
            slug = `${baseSlug}-${counter}`;
            counter++;
            existingService = await this.serviceRepository.findOne({ slug, is_deleted: false });
        }

        return slug;
    }

    public async createService(model: CreateServiceDto, file?: Express.Multer.File): Promise<IService> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        // Convert string values to appropriate types (needed for multipart/form-data)
        if (typeof model.price === 'string') {
            model.price = parseFloat(model.price);
        }

        if (typeof model.estimated_time === 'string') {
            model.estimated_time = parseFloat(model.estimated_time);
        }

        // Handle empty string for parent_service_id
        if (model.parent_service_id === '') {
            model.parent_service_id = null as any;
        }

        // Xác thực tên dịch vụ
        if (!model.name || model.name.trim() === '') {
            throw new HttpException(HttpStatus.BadRequest, 'Service name is required');
        }

        // Xác thực mô tả
        if (!model.description || model.description.trim() === '') {
            throw new HttpException(HttpStatus.BadRequest, 'Service description is required');
        }

        // Xác thực giá
        if (isNaN(model.price) || model.price <= 0) {
            throw new HttpException(HttpStatus.BadRequest, 'Service price must be a valid number greater than 0');
        }

        // Xác thực thời gian ước tính
        if (isNaN(model.estimated_time) || model.estimated_time <= 0) {
            throw new HttpException(HttpStatus.BadRequest, 'Estimated time must be a valid number greater than 0');
        }

        // Xác thực loại dịch vụ
        if (!Object.values(ServiceTypeEnum).includes(model.type as ServiceTypeEnum)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid service type');
        }

        // Xác thực parent_service_id
        if (model.parent_service_id && model.parent_service_id.trim() !== '') {
            const parentService = await this.serviceRepository.findByIdAndPopulateParentService(model.parent_service_id);
            if (!parentService) {
                throw new HttpException(HttpStatus.BadRequest, 'Parent service not found');
            }
        }

        // // Xác thực phương thức lấy mẫu
        // if (!Object.values(SampleMethodEnum).includes(model.sample_method as SampleMethodEnum)) {
        //     throw new HttpException(HttpStatus.BadRequest, 'Invalid sample method');
        // }

        // kiểm tra tên dịch vụ có bị trùng không
        const existingService = await this.serviceRepository.findOne({ name: model.name, is_deleted: false });
        if (existingService) {
            throw new HttpException(HttpStatus.Conflict, 'Service with this name already exists');
        }

        // Generate slug if not provided
        if (!model.slug) {
            model.slug = await this.ensureUniqueSlug(this.generateSlug(model.name));
        } else {
            // If slug is provided, ensure it's URL-friendly
            model.slug = this.generateSlug(model.slug);
            // Check if the slug is unique
            model.slug = await this.ensureUniqueSlug(model.slug);
        }

        let newService = {
            ...model,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        };

        // If there's a file, upload the image (for any service type)
        if (file) {
            try {
                // Create the service first to get the ID
                const createdService = await this.serviceRepository.createService(newService);

                // Upload image to S3
                const imageUrl = await uploadFileToS3(file, createdService._id, s3Folders.personImages);

                // Update service with image URL
                const updatedService = await this.serviceRepository.findByIdAndUpdate(
                    createdService._id,
                    { image_url: imageUrl },
                    { new: true }
                );

                return updatedService || createdService;
            } catch (error) {
                console.error('Error uploading image during service creation:', error);
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to upload image');
            }
        }

        return this.serviceRepository.createService(newService);
    }

    /**
     * Lấy danh sách dịch vụ với các bộ lọc tùy chọn và phân trang
     */
    public async getServices(queryParams: any = {}): Promise<SearchPaginationResponseModel<IService>> {
        try {
            const query: any = { is_deleted: false };

            // Xử lý và làm sạch các tham số truy vấn
            const cleanParams = this.processQueryParams(queryParams);

            // Xử lý các tham số phân trang
            const page = cleanParams.pageNum ? parseInt(cleanParams.pageNum) : 1; // trang hiện tại
            const limit = cleanParams.pageSize ? parseInt(cleanParams.pageSize) : 10; // số lượng bản ghi trên mỗi trang
            const skip = (page - 1) * limit; // số bản ghi bị bỏ qua

            // Xử lý sắp xếp
            const sortField = cleanParams.sort_by || 'created_at'; // trường sắp xếp mặc định là created_at
            const sortOrder = cleanParams.sort_order === 'asc' ? 1 : -1; // thứ tự sắp xếp mặc định là tăng dần
            const sortOptions: any = {}; // khởi tạo một đối tượng để lưu trữ các tùy chọn sắp xếp
            sortOptions[sortField] = sortOrder; // thêm tùy chọn sắp xếp vào đối tượng

            // Xử lý các tham số lọc
            if (cleanParams.type) {
                query.type = new RegExp(`^${cleanParams.type}$`, 'i'); // tìm kiếm theo loại dịch vụ với tùy chọn không phân biệt chữ hoa và chữ thường
            }

            // if (cleanParams.sample_method) {
            //     query.sample_method = new RegExp(`^${cleanParams.sample_method}$`, 'i'); // tìm kiếm theo phương thức lấy mẫu với tùy chọn không phân biệt chữ hoa và chữ thường
            // }

            if (cleanParams.is_active !== undefined) {
                query.is_active = cleanParams.is_active;
            }

            if (cleanParams.min_price !== undefined || cleanParams.max_price !== undefined) {
                query.price = {};
                if (cleanParams.min_price !== undefined) {
                    query.price.$gte = cleanParams.min_price; // giá >= min_price
                }
                if (cleanParams.max_price !== undefined) {
                    query.price.$lte = cleanParams.max_price; // giá <= max_price
                }
            }

            // Lọc dữ liệu theo thời gian tạo
            if (cleanParams.start_date || cleanParams.end_date) {
                query.created_at = {};
                if (cleanParams.start_date) {
                    query.created_at.$gte = new Date(cleanParams.start_date); // ngày tạo >= start_date
                }
                if (cleanParams.end_date) {
                    const endDate = new Date(cleanParams.end_date);
                    endDate.setHours(23, 59, 59, 999); // set thời gian cuối ngày là 23:59:59.999
                    query.created_at.$lte = endDate; // ngày tạo <= end_date
                }
            }

            // Tìm kiếm theo từ khóa (nếu có)
            if (cleanParams.keyword) {
                const keyword = cleanParams.keyword.toLowerCase();
                query.$or = [
                    { name: { $regex: keyword, $options: 'i' } }, // tìm kiếm theo tên dịch vụ với tùy chọn không phân biệt chữ hoa và chữ thường
                    { description: { $regex: keyword, $options: 'i' } }
                ];
            }

            // Đếm tổng số bản ghi phù hợp với điều kiện tìm kiếm
            const totalItems = await this.serviceRepository.countDocuments(query);

            // Lấy dữ liệu với phân trang và sắp xếp
            const items = await this.serviceRepository.find(query, sortOptions, skip, limit);

            // Tính toán thông tin phân trang
            const totalPages = Math.ceil(totalItems / limit);
            // Trả về kết quả theo định dạng SearchPaginationResponseModel
            return {
                pageData: items,
                pageInfo: {
                    totalItems,
                    totalPages,
                    pageNum: page,
                    pageSize: limit,
                }
            };
        } catch (error) {
            console.error('Error in getServices:', error);
            throw error;
        }
    }

    /**
     * Tạo query từ các tham số truyền vào
     */
    private processQueryParams(params: any): {
        type?: string;
        // sample_method?: string;
        is_active?: boolean;
        min_price?: number;
        max_price?: number;
        pageNum?: string;
        pageSize?: string;
        keyword?: string;
        sort_by?: string;
        sort_order?: string;
        start_date?: string;
        end_date?: string;
    } {
        const processedParams: Record<string, any> = {}; // khởi tạo một đối tượng để lưu trữ các tham số đã xử lý

        // Duyệt qua từng key của params
        Object.keys(params).forEach(key => {
            const trimmedKey = key.trim(); // loại bỏ khoảng trắng ở đầu và cuối của key
            const normalizedKey = trimmedKey.replace(/-/g, '_'); // thay thế dấu gạch ngang bằng dấu gạch dưới
            processedParams[normalizedKey] = params[key]; // lưu trữ giá trị của key vào processedParams
        });

        // Xác thực các trường sắp xếp hợp lệ để tránh lỗi injection
        const allowedSortFields = ['name', 'price', 'created_at', 'estimated_time'];
        const sortBy = processedParams.sort_by?.toLowerCase();

        return {
            type: processedParams.type?.toLowerCase(),
            // sample_method: processedParams.sample_method?.toLowerCase(),
            is_active: processedParams.is_active === 'true',
            min_price: processedParams.min_price ? parseFloat(processedParams.min_price) : undefined,
            max_price: processedParams.max_price ? parseFloat(processedParams.max_price) : undefined,
            pageNum: processedParams.pageNum || '1',
            pageSize: processedParams.pageSize || '10',
            keyword: processedParams.keyword,
            sort_by: allowedSortFields.includes(sortBy) ? sortBy : 'created_at',
            sort_order: processedParams.sort_order === 'asc' ? 'asc' : 'desc',
            start_date: processedParams.start_date,
            end_date: processedParams.end_date
        };
    }

    /**
     * Cập nhật dịch vụ
     */
    public async updateService(id: string, model: Partial<UpdateServiceDto>, file?: Express.Multer.File): Promise<IService | undefined> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const existingService = await this.serviceRepository.findById(id);
        if (!existingService) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }

        // Convert string values to appropriate types (needed for multipart/form-data)
        if (typeof model.price === 'string') {
            model.price = parseFloat(model.price);
        }

        if (typeof model.estimated_time === 'string') {
            model.estimated_time = parseFloat(model.estimated_time);
        }

        // Handle empty string for parent_service_id
        if (model.parent_service_id === '') {
            model.parent_service_id = null as any;
        }

        // Validate name if provided
        if (model.name && model.name.trim() === '') {
            throw new HttpException(HttpStatus.BadRequest, 'Service name cannot be empty');
        }

        // Validate description if provided
        if (model.description && model.description.trim() === '') {
            throw new HttpException(HttpStatus.BadRequest, 'Service description cannot be empty');
        }

        // Validate price if provided
        if (model.price !== undefined && (isNaN(model.price) || model.price <= 0)) {
            throw new HttpException(HttpStatus.BadRequest, 'Service price must be a valid number greater than 0');
        }

        // Validate estimated time if provided
        if (model.estimated_time !== undefined && (isNaN(model.estimated_time) || model.estimated_time <= 0)) {
            throw new HttpException(HttpStatus.BadRequest, 'Estimated time must be a valid number greater than 0');
        }

        // Validate service type if provided
        if (model.type && !Object.values(ServiceTypeEnum).includes(model.type as ServiceTypeEnum)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid service type');
        }

        // Validate parent service ID if provided
        if (model.parent_service_id && model.parent_service_id.trim() !== '') {
            const parentService = await this.serviceRepository.findById(model.parent_service_id);
            if (!parentService) {
                throw new HttpException(HttpStatus.BadRequest, 'Parent service not found');
            }
        }

        // // Validate sample method if provided
        // if (model.sample_method && !Object.values(SampleMethodEnum).includes(model.sample_method as SampleMethodEnum)) {
        //     throw new HttpException(HttpStatus.BadRequest, 'Invalid sample method');
        // }

        // Check for name uniqueness if name is being updated
        if (model.name && model.name !== existingService.name) {
            const serviceWithSameName = await this.serviceRepository.findOne({
                name: model.name,
                is_deleted: false,
                _id: { $ne: id } // Exclude the current service
            });
            if (serviceWithSameName) {
                throw new HttpException(HttpStatus.Conflict, 'Service with this name already exists');
            }
        }

        // Update slug if name is changed or slug is provided
        if ((model.name && model.name !== existingService.name) || model.slug) {
            const baseSlug = model.slug ? this.generateSlug(model.slug) : this.generateSlug(model.name || existingService.name);

            // Only check for uniqueness if the slug is different from the current one
            if (baseSlug !== existingService.slug) {
                model.slug = await this.ensureUniqueSlug(baseSlug);
            } else {
                model.slug = baseSlug;
            }
        }

        // Handle file upload if provided
        if (file) {
            try {
                const imageUrl = await uploadFileToS3(file, id, s3Folders.personImages);
                model.image_url = imageUrl;
            } catch (error) {
                console.error('Error uploading image during service update:', error);
                throw new HttpException(HttpStatus.InternalServerError, 'Failed to upload image');
            }
        }

        const updateData = {
            ...model,
            updated_at: new Date()
        };

        const updatedService = await this.serviceRepository.findByIdAndUpdate(
            id,
            updateData,
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
        const service = await this.serviceRepository.findByIdAndUpdate(
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
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }
        return service;
    }

    /**
     * Tìm kiếm dịch vụ theo loại
     */
    public async getServicesByType(type: ServiceType): Promise<IService[]> {
        return this.serviceRepository.findAll({ type, is_active: true });
    }

    /**
     * Lấy dịch vụ theo phương thức lấy mẫu
     */
    public async getServicesBySampleMethod(sampleMethod: SampleMethod): Promise<IService[]> {
        return this.serviceRepository.findAll({ sample_method: sampleMethod, is_active: true });
    }

    /**
     * Lấy danh sách dịch vụ con của một dịch vụ cha
     */
    public async getChildServices(parentServiceId: string): Promise<IService[]> {
        const parentService = await this.serviceRepository.findChildServices({ parent_service_id: parentServiceId });
        if (!parentService) {
            throw new HttpException(HttpStatus.NotFound, 'Parent service not found');
        }
        return parentService;
    }

    /**
     * Lấy danh sách dịch vụ dựa trên thông tin cuộc hẹn
     */
    public async getServicesByAppointment(queryParams: any = {}): Promise<SearchPaginationResponseModel<IService>> {
        try {
            // Xử lý và làm sạch các tham số truy vấn
            const cleanParams = this.processAppointmentParams(queryParams);

            // Xử lý các tham số phân trang
            const page = cleanParams.pageNum ? parseInt(cleanParams.pageNum) : 1;
            const limit = cleanParams.pageSize ? parseInt(cleanParams.pageSize) : 10;
            const skip = (page - 1) * limit;

            // Tạo query để tìm kiếm các appointment phù hợp
            const appointmentQuery: any = {};

            // Lọc theo trạng thái cuộc hẹn
            if (cleanParams.status) {
                appointmentQuery.status = cleanParams.status;
            }

            // Lọc theo ngày hẹn
            if (cleanParams.start_appointment_date || cleanParams.end_appointment_date) {
                appointmentQuery.appointment_date = {};
                if (cleanParams.start_appointment_date) {
                    appointmentQuery.appointment_date.$gte = new Date(cleanParams.start_appointment_date);
                }
                if (cleanParams.end_appointment_date) {
                    const endDate = new Date(cleanParams.end_appointment_date);
                    endDate.setHours(23, 59, 59, 999);
                    appointmentQuery.appointment_date.$lte = endDate;
                }
            }

            // Lọc theo loại cuộc hẹn (SELF, FACILITY, HOME)
            if (cleanParams.appointment_type) {
                appointmentQuery.type = cleanParams.appointment_type;
            }

            // Lọc theo khách hàng
            if (cleanParams.customer_id) {
                appointmentQuery.user_id = cleanParams.customer_id;
            }

            // Lọc theo nhân viên
            if (cleanParams.staff_id) {
                appointmentQuery.staff_id = cleanParams.staff_id;
            }

            // Lọc theo địa chỉ làm xét nghiệm (nếu là tại nhà)
            if (cleanParams.collection_address) {
                appointmentQuery.collection_address = { $regex: cleanParams.collection_address, $options: 'i' };
            }

            console.log('Appointment query:', appointmentQuery);

            // Tìm các appointment phù hợp và chỉ lấy service_id
            const appointments = await this.appointmentSchema.find(appointmentQuery).select('service_id');
            console.log('Found appointments:', appointments.length);

            // Lấy danh sách các service_id từ các appointment
            const serviceIds = appointments.map(app => app.service_id);

            // Loại bỏ các giá trị trùng lặp và giá trị null/undefined
            const uniqueServiceIds = [...new Set(serviceIds.filter(id => id))];
            console.log('Unique service IDs:', uniqueServiceIds.length);

            // Nếu không có service_id nào, trả về danh sách trống
            if (uniqueServiceIds.length === 0) {
                return {
                    pageData: [],
                    pageInfo: {
                        totalItems: 0,
                        totalPages: 0,
                        pageNum: page,
                        pageSize: limit,
                    }
                };
            }

            // Tạo query để tìm các service tương ứng
            const serviceQuery: any = {
                _id: { $in: uniqueServiceIds },
                is_deleted: false
            };

            // Xử lý lọc bổ sung cho service
            if (cleanParams.is_active !== undefined) {
                serviceQuery.is_active = cleanParams.is_active;
            }

            if (cleanParams.type) {
                serviceQuery.type = cleanParams.type;
            }

            if (cleanParams.sample_method) {
                serviceQuery.sample_method = cleanParams.sample_method;
            }

            if (cleanParams.min_price !== undefined || cleanParams.max_price !== undefined) {
                serviceQuery.price = {};
                if (cleanParams.min_price !== undefined) {
                    serviceQuery.price.$gte = cleanParams.min_price;
                }
                if (cleanParams.max_price !== undefined) {
                    serviceQuery.price.$lte = cleanParams.max_price;
                }
            }

            // Tìm kiếm theo từ khóa trên service (nếu có)
            if (cleanParams.keyword) {
                const keyword = cleanParams.keyword.toLowerCase();
                serviceQuery.$or = [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ];
            }

            console.log('Service query:', serviceQuery);

            // Đếm tổng số dịch vụ phù hợp
            const totalItems = await this.serviceRepository.countDocuments(serviceQuery);
            console.log('Total matching services:', totalItems);

            // Xử lý sắp xếp
            const sortField = cleanParams.sort_by || 'created_at';
            const sortOrder = cleanParams.sort_order === 'asc' ? 1 : -1;
            const sortOptions: any = {};
            sortOptions[sortField] = sortOrder;

            // Lấy danh sách dịch vụ với phân trang
            const services = await this.serviceRepository.find(serviceQuery, sortOptions, skip, limit);

            console.log('Retrieved services:', services.length);

            // Tính toán thông tin phân trang
            const totalPages = Math.ceil(totalItems / limit);

            // Trả về kết quả
            return {
                pageData: services,
                pageInfo: {
                    totalItems,
                    totalPages,
                    pageNum: page,
                    pageSize: limit,
                }
            };
        } catch (error) {
            console.error('Error in getServicesByAppointment:', error);
            throw error;
        }
    }

    /**
     * Xử lý tham số truy vấn cho API service-appointment
     */
    private processAppointmentParams(params: any): {
        status?: string;
        start_appointment_date?: string;
        end_appointment_date?: string;
        appointment_type?: string;
        customer_id?: string;
        staff_id?: string;
        collection_address?: string;
        is_active?: boolean;
        type?: string;
        sample_method?: string;
        min_price?: number;
        max_price?: number;
        pageNum?: string;
        pageSize?: string;
        keyword?: string;
        sort_by?: string;
        sort_order?: string;
    } {
        const processedParams: Record<string, any> = {};

        // Duyệt qua từng key của params
        Object.keys(params).forEach(key => {
            const trimmedKey = key.trim();
            const normalizedKey = trimmedKey.replace(/-/g, '_');
            processedParams[normalizedKey] = params[key];
        });

        // Xác thực các trường sắp xếp hợp lệ
        const allowedSortFields = ['name', 'price', 'created_at', 'estimated_time'];
        const sortBy = processedParams.sort_by?.toLowerCase();

        return {
            status: processedParams.status,
            start_appointment_date: processedParams.start_appointment_date,
            end_appointment_date: processedParams.end_appointment_date,
            appointment_type: processedParams.appointment_type,
            customer_id: processedParams.customer_id,
            staff_id: processedParams.staff_id,
            collection_address: processedParams.collection_address,
            is_active: processedParams.is_active === 'true',
            type: processedParams.type?.toLowerCase(),
            sample_method: processedParams.sample_method?.toLowerCase(),
            min_price: processedParams.min_price ? parseFloat(processedParams.min_price) : undefined,
            max_price: processedParams.max_price ? parseFloat(processedParams.max_price) : undefined,
            pageNum: processedParams.pageNum || '1',
            pageSize: processedParams.pageSize || '10',
            keyword: processedParams.keyword,
            sort_by: allowedSortFields.includes(sortBy) ? sortBy : 'created_at',
            sort_order: processedParams.sort_order === 'asc' ? 'asc' : 'desc',
        };
    }

    /**
     * Đếm số lượng dịch vụ theo loại
     */
    public async countServicesByType(queryParams: any = {}): Promise<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        bySampleMethod: Record<string, number>;
    }> {
        try {
            // Xử lý tham số truy vấn
            const cleanParams = this.processQueryParams(queryParams);

            // Xây dựng query cơ bản
            const baseQuery: any = { is_deleted: false };

            // Thêm các điều kiện lọc nếu có
            if (cleanParams.is_active !== undefined) {
                baseQuery.is_active = cleanParams.is_active;
            }

            if (cleanParams.keyword) {
                const keyword = cleanParams.keyword.toLowerCase();
                baseQuery.$or = [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ];
            }

            // Ghi log query để debug
            console.log('Base query for counting:', baseQuery);

            // Đếm tổng số dịch vụ
            const total = await this.serviceRepository.countDocuments(baseQuery);
            console.log('Total services:', total);

            // Khởi tạo các objects kết quả với giá trị mặc định
            const byType: Record<string, number> = {
                [ServiceTypeEnum.CIVIL]: 0,
                [ServiceTypeEnum.ADMINISTRATIVE]: 0
            };

            const bySampleMethod: Record<string, number> = {
                [SampleMethodEnum.SELF_COLLECTED]: 0,
                [SampleMethodEnum.FACILITY_COLLECTED]: 0,
                [SampleMethodEnum.HOME_COLLECTED]: 0
            };

            const byStatus = {
                active: 0,
                inactive: 0
            };

            // Nếu không có dịch vụ nào, trả về kết quả với các giá trị mặc định
            if (total === 0) {
                return {
                    total: 0,
                    byType,
                    byStatus,
                    bySampleMethod
                };
            }

            // Đếm theo loại dịch vụ
            const typeCountsPromise = Promise.all([
                this.serviceRepository.countDocuments({ ...baseQuery, type: ServiceTypeEnum.CIVIL }),
                this.serviceRepository.countDocuments({ ...baseQuery, type: ServiceTypeEnum.ADMINISTRATIVE })
            ]);

            // Đếm theo trạng thái (luôn đếm cả active và inactive, bất kể giá trị is_active trong query)
            const activeQuery = { ...baseQuery, is_active: true };
            const inactiveQuery = { ...baseQuery, is_active: false };

            // Xóa điều kiện is_active khỏi query để đếm tất cả trạng thái
            if (activeQuery.is_active !== undefined) delete activeQuery.is_active;
            if (inactiveQuery.is_active !== undefined) delete inactiveQuery.is_active;

            const statusCountsPromise = Promise.all([
                this.serviceRepository.countDocuments({ ...activeQuery, is_active: true }),
                this.serviceRepository.countDocuments({ ...inactiveQuery, is_active: false })
            ]);

            // Đếm theo phương thức lấy mẫu
            const sampleMethodCountsPromise = Promise.all([
                this.serviceRepository.countDocuments({ ...baseQuery, sample_method: SampleMethodEnum.SELF_COLLECTED }),
                this.serviceRepository.countDocuments({ ...baseQuery, sample_method: SampleMethodEnum.FACILITY_COLLECTED }),
                this.serviceRepository.countDocuments({ ...baseQuery, sample_method: SampleMethodEnum.HOME_COLLECTED })
            ]);

            // Đợi tất cả các truy vấn hoàn thành
            const [typeCounts, statusCounts, sampleMethodCounts] = await Promise.all([
                typeCountsPromise,
                statusCountsPromise,
                sampleMethodCountsPromise
            ]);

            // Cập nhật kết quả
            byType[ServiceTypeEnum.CIVIL] = typeCounts[0];
            byType[ServiceTypeEnum.ADMINISTRATIVE] = typeCounts[1];

            byStatus.active = statusCounts[0];
            byStatus.inactive = statusCounts[1];

            bySampleMethod[SampleMethodEnum.SELF_COLLECTED] = sampleMethodCounts[0];
            bySampleMethod[SampleMethodEnum.FACILITY_COLLECTED] = sampleMethodCounts[1];
            bySampleMethod[SampleMethodEnum.HOME_COLLECTED] = sampleMethodCounts[2];

            console.log('Count statistics:', {
                total,
                byType,
                byStatus,
                bySampleMethod
            });

            return {
                total,
                byType,
                byStatus,
                bySampleMethod
            };
        } catch (error) {
            console.error('Error in countServicesByType:', error);
            throw error;
        }
    }

    /**
     * Thay đổi trạng thái hoạt động của dịch vụ
     */
    public async changeServiceStatus(id: string, isActive: boolean): Promise<IService> {
        // Kiểm tra dịch vụ có tồn tại không
        const service = await this.serviceRepository.findById(id);
        if (!service) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }

        // Kiểm tra nếu dịch vụ đã bị xóa
        if (service.is_deleted) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot change status of a deleted service');
        }

        // Nếu trạng thái    không thay đổi, trả về dịch vụ hiện tại
        if (service.is_active === isActive) {
            return service;
        }

        // Cập nhật trạng thái
        const updatedService = await this.serviceRepository.findByIdAndUpdate(
            id,
            {
                is_active: isActive,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedService) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to update service status');
        }

        return updatedService;
    }

    /**
     * Get all services with images
     * @returns Array of services with images
     */
    public async getServicesWithImages(): Promise<IService[]> {
        try {
            // Find all services that have an image_url
            const services = await this.serviceRepository.findAll({
                image_url: { $exists: true, $ne: null },
                is_deleted: false,
                is_active: true
            });

            return services;
        } catch (error) {
            console.error('Error getting services with images:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to get services with images');
        }
    }

    /**
     * Get a service by its slug
     * @param slug The slug of the service to retrieve
     * @returns The service with the specified slug
     */
    public async getServiceBySlug(slug: string): Promise<IService> {
        const service = await this.serviceRepository.findBySlug(slug);
        if (!service) {
            throw new HttpException(HttpStatus.NotFound, `Service with slug '${slug}' not found`);
        }
        return service;
    }
}