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
import { AppointmentStatusEnum } from '../appointment/appointment.enum';
import AppointmentSchema from '../appointment/appointment.model';

export default class ServiceService {
    public serviceSchema = ServiceSchema;
    public appointmentSchema = AppointmentSchema;

    public async createService(model: CreateServiceDto): Promise<IService> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
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

        // Ví dụ: Nếu dịch vụ là xét nghiệm tại nhà, tăng giá thêm 20%
        if (model.sample_method === SampleMethodEnum.HOME_COLLECTED) {
            model.price = Math.round(model.price * 1.2);
        }

        // Ví dụ: Nếu dịch vụ hành chính có thời gian ước tính > 48h, giảm giá 10%
        if (model.type === ServiceTypeEnum.ADMINISTRATIVE && model.estimated_time > 48 && model.sample_method === SampleMethodEnum.FACILITY_COLLECTED) {
            model.price = Math.round(model.price * 0.9);
        }

        // kiểm tra tên dịch vụ có bị trùng không
        // Nếu có dịch vụ trùng tên nhưng đã bị xóa (is_deleted = true) thì vẫn cho phép tạo mới
        const existingService = await this.serviceSchema.findOne({ name: model.name, is_deleted: false });
        if (existingService) {
            throw new HttpException(HttpStatus.Conflict, 'Service with this name already exists');
        }

        // Tạo dịch vụ mới
        let newService = {
            ...model,
            is_active: true, // Mặc định dịch vụ mới là active
            created_at: new Date(),
            updated_at: new Date(),
        };

        return this.serviceSchema.create(newService);
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

            if (cleanParams.sample_method) {
                query.sample_method = new RegExp(`^${cleanParams.sample_method}$`, 'i'); // tìm kiếm theo phương thức lấy mẫu với tùy chọn không phân biệt chữ hoa và chữ thường
            }

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
            const totalItems = await this.serviceSchema.countDocuments(query); // đếm tổng số bản ghi phù hợp với điều kiện tìm kiếm

            // Lấy dữ liệu với phân trang và sắp xếp
            const items = await this.serviceSchema
                .find(query) // tìm kiếm dữ liệu phù hợp với điều kiện tìm kiếm
                .sort(sortOptions) // sắp xếp dữ liệu theo tùy chọn sắp xếp
                .skip(skip) // bỏ qua số bản ghi được chỉ định
                .limit(limit); // giới hạn số bản ghi trả về

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
        sample_method?: string;
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
            sample_method: processedParams.sample_method?.toLowerCase(),
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
    public async updateService(id: string, model: Partial<UpdateServiceDto>): Promise<IService | undefined> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const service = await this.serviceSchema.findById(id);
        if (!service) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }

        // Cập nhật giá
        if (model.price || model.sample_method || model.type || model.estimated_time) {
            const updatedModel = {
                ...service.toObject(),
                ...model
            } as UpdateServiceDto;

            // kiểm tra tên dịch vụ có bị trùng không
            const existingService = await this.serviceSchema.findOne({ name: updatedModel.name });
            if (existingService) {
                throw new HttpException(HttpStatus.Conflict, 'Service with this name already exists');
            }

            // Ví dụ: Nếu dịch vụ là xét nghiệm tại nhà, tăng giá thêm 20%
            if (updatedModel.sample_method === SampleMethodEnum.HOME_COLLECTED) {
                updatedModel.price = Math.round(updatedModel.price * 1.2);
            }

            // Ví dụ: Nếu dịch vụ hành chính có thời gian ước tính > 48h, giảm giá 10%
            if (updatedModel.type === ServiceTypeEnum.ADMINISTRATIVE && updatedModel.estimated_time > 48 && updatedModel.sample_method === SampleMethodEnum.FACILITY_COLLECTED) {
                updatedModel.price = Math.round(updatedModel.price * 0.9);
            }

            // Cập nhật dịch vụ
            const updatedService = await this.serviceSchema.findByIdAndUpdate(
                id, {
                ...updatedModel,
                updated_at: new Date()
            }
            );

            if (!updatedService) {
                throw new HttpException(HttpStatus.NotFound, 'Service not found');
            }

            return updatedService;
        }
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

            // Tìm các appointment phù hợp
            const appointments = await this.appointmentSchema.find(appointmentQuery).select('service_id');

            // Lấy danh sách các service_id từ các appointment
            const serviceIds = appointments.map(app => app.service_id);

            // Nếu không có service_id nào, trả về danh sách trống
            if (serviceIds.length === 0) {
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
                _id: { $in: serviceIds },
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

            // Đếm tổng số dịch vụ phù hợp
            const totalItems = await this.serviceSchema.countDocuments(serviceQuery);

            // Xử lý sắp xếp
            const sortField = cleanParams.sort_by || 'created_at';
            const sortOrder = cleanParams.sort_order === 'asc' ? 1 : -1;
            const sortOptions: any = {};
            sortOptions[sortField] = sortOrder;

            // Lấy danh sách dịch vụ với phân trang
            const services = await this.serviceSchema
                .find(serviceQuery)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);

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
}