import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { IError } from "../../core/interfaces";
import { SearchPaginationResponseModel } from "../../core/models";
import { IDepartment } from "./department.interface";
import DepartmentSchema from "./department.model";
import CreateDepartmentDto from "./dtos/createDepartment.dto";
import UpdateDepartmentDto from "./dtos/updateDepartment.dto";
import { isEmptyObject } from "../../core/utils";
import { UserRoleEnum, UserSchema } from "../user";
import mongoose from "mongoose";

export default class DepartmentService {
    private departmentSchema = DepartmentSchema;
    private userSchema = UserSchema;

    /**
     * Tạo phòng ban mới
     */
    public async createDepartment(model: CreateDepartmentDto): Promise<IDepartment> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Dữ liệu đầu vào không được trống');
        }

        // Kiểm tra tên phòng ban đã tồn tại chưa
        const existingDepartment = await this.departmentSchema.findOne({ name: model.name });
        if (existingDepartment) {
            throw new HttpException(HttpStatus.Conflict, `The department with name "${model.name}" already exists`);
        }

        // Kiểm tra manager_id có tồn tại và có phải là Manager không
        if (!mongoose.Types.ObjectId.isValid(model.manager_id) || !(await this.userSchema.findById(model.manager_id))) {
            throw new HttpException(HttpStatus.BadRequest, 'The manager ID is invalid');
        }

        const manager = await this.userSchema.findById(model.manager_id);
        if (!manager || manager.role !== UserRoleEnum.MANAGER) {
            throw new HttpException(HttpStatus.BadRequest, 'The manager must have the role of Manager');
        }

        // Tạo phòng ban mới
        const department = await this.departmentSchema.create({
            ...model,
            created_at: new Date(),
            updated_at: new Date()
        });

        return department;
    }

    /**
     * Lấy danh sách phòng ban với bộ lọc và phân trang
     */
    public async getDepartments(queryParams: any = {}): Promise<SearchPaginationResponseModel<IDepartment>> {
        try {
            const {
                pageNum,
                pageSize,
                sort_by,
                sort_order,
                keyword,
                is_deleted
            } = this.processQueryParams(queryParams);

            const skip = (pageNum - 1) * pageSize;

            // Xây dựng truy vấn
            const query: any = {};

            // 1. Xử lý trạng thái is_deleted
            if (is_deleted !== undefined) {
                query.is_deleted = is_deleted;
            } else {
                // Mặc định chỉ hiển thị các phòng ban chưa bị xóa logic
                query.is_deleted = false;
                query.is_active = true;
            }

            // 2. Tìm kiếm theo từ khóa nếu có
            if (keyword) {
                query.$or = [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } }
                ];
            }

            // Đếm tổng số phòng ban
            const totalItems = await this.departmentSchema.countDocuments(query);

            const sortOptions: any = {};
            sortOptions[sort_by] = sort_order === 'asc' ? 1 : -1; // Sắp xếp theo trường và thứ tự

            // Lấy dữ liệu với phân trang
            const departments = await this.departmentSchema
                .find(query) // Tìm kiếm theo các điều kiện trong query
                .sort(sortOptions) // Sắp xếp theo trường và thứ tự
                .skip(skip) // Bỏ qua các bản ghi đầu tiên
                .limit(pageSize) // Giới hạn số bản ghi trả về
                .populate('manager_id', 'first_name last_name email'); // Populate thông tin người quản lý

            // Tính tổng số trang
            const totalPages = Math.ceil(totalItems / pageSize);

            // Kết quả trả về
            return {
                pageData: departments,
                pageInfo: {
                    totalItems,
                    totalPages,
                    pageNum: pageNum,
                    pageSize: pageSize
                }
            };
        } catch (error) {
            console.error('Error in getDepartments:', error);
            throw new HttpException(HttpStatus.InternalServerError, 'Error when getting the list of departments');
        }
    }

    /**
     * Lấy thông tin phòng ban theo ID
     */
    public async getDepartmentById(id: string): Promise<IDepartment> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'The department ID is invalid');
        }

        const department = await this.departmentSchema
            .findById(id)
            .populate('manager_id', 'first_name last_name email');

        if (!department) {
            throw new HttpException(HttpStatus.NotFound, 'The department is not found');
        }

        return department;
    }

    /**
     * Cập nhật thông tin phòng ban
     */
    public async updateDepartment(id: string, model: UpdateDepartmentDto): Promise<IDepartment> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Dữ liệu cập nhật không được trống');
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'The department ID is invalid');
        }

        // Kiểm tra phòng ban tồn tại
        const department = await this.departmentSchema.findById(id);
        if (!department) {
            throw new HttpException(HttpStatus.NotFound, 'The department is not found');
        }

        // Kiểm tra tên phòng ban đã tồn tại chưa (nếu tên thay đổi)
        if (model.name !== department.name) {
            const existingDepartment = await this.departmentSchema.findOne({ name: model.name, _id: { $ne: id } });
            if (existingDepartment) {
                throw new HttpException(HttpStatus.Conflict, `The department with name "${model.name}" already exists`);
            }
        }

        // Kiểm tra manager_id có tồn tại
        if (model.manager_id && !mongoose.Types.ObjectId.isValid(model.manager_id)) {
            throw new HttpException(HttpStatus.BadRequest, 'The manager ID is invalid');
        }

        if (model.manager_id) {
            const manager = await this.userSchema.findById(model.manager_id);
            if (!manager || manager.role !== UserRoleEnum.MANAGER) {
                throw new HttpException(HttpStatus.BadRequest, 'The manager must have the role of Manager');
            }
        }

        // Cập nhật phòng ban
        const updatedDepartment = await this.departmentSchema.findByIdAndUpdate(
            id,
            {
                ...model,
                updated_at: new Date()
            },
            { new: true } // Trả về dữ liệu sau khi cập nhật
        ).populate('manager_id', 'first_name last_name email');

        if (!updatedDepartment) {
            throw new HttpException(HttpStatus.InternalServerError, 'Cannot update the department');
        }

        return updatedDepartment;
    }

    /**
     * Xóa phòng ban bằng cách cập nhật cột is_deleted thành true
     */
    public async deleteDepartment(id: string): Promise<IDepartment> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'The department ID is invalid');
        }

        // Kiểm tra phòng ban tồn tại
        const department = await this.departmentSchema.findById(id);
        if (!department) {
            throw new HttpException(HttpStatus.NotFound, 'The department is not found');
        }

        // Cập nhật cột is_deleted thành true
        const deletedDepartment = await this.departmentSchema.findByIdAndUpdate(
            id,
            { is_deleted: true, is_active: false, updated_at: new Date() },
            { new: true }
        );

        if (!deletedDepartment) {
            throw new HttpException(HttpStatus.InternalServerError, 'Cannot delete the department');
        }

        return deletedDepartment;
    }

    /**
     * Xử lý tham số truy vấn
     */
    private processQueryParams(params: any): {
        pageNum: number;
        pageSize: number;
        is_deleted?: boolean;
        sort_by: string;
        sort_order: string;
        keyword?: string;
    } {
        const processedParams: Record<string, any> = {}; // Khởi tạo một đối tượng để lưu trữ các tham số đã xử lý

        // Xử lý tham số
        Object.keys(params).forEach(key => {
            const trimmedKey = key.trim(); // Loại bỏ khoảng trắng ở đầu và cuối
            const normalizedKey = trimmedKey.replace(/-/g, '_'); // Thay thế dấu '-' bằng dấu '_'
            processedParams[normalizedKey] = params[key]; // Lưu trữ giá trị vào processedParams
        });

        // Xác thực trường sắp xếp hợp lệ
        const allowedSortFields = ['name', 'created_at', 'updated_at'];
        const sortBy = processedParams.sort_by?.toLowerCase();

        // Xử lý các tham số boolean
        const processBoolean = (value: any): boolean | undefined => {
            if (value === undefined || value === '') return undefined; // Nếu giá trị không xác định hoặc rỗng, trả về undefined
            if (typeof value === 'boolean') return value; // Nếu giá trị là boolean, trả về giá trị đó
            if (value === 'true') return true; // Nếu giá trị là 'true', trả về true
            if (value === 'false') return false; // Nếu giá trị là 'false', trả về false
            return undefined; // Nếu không phải là boolean, trả về undefined
        };

        return {
            pageNum: processedParams.pageNum ? parseInt(processedParams.pageNum) : 1,
            pageSize: processedParams.pageSize ? parseInt(processedParams.pageSize) : 10,
            sort_by: allowedSortFields.includes(sortBy) ? sortBy : 'created_at',
            sort_order: processedParams.sort_order === 'asc' ? 'asc' : 'desc',
            keyword: processedParams.keyword,
            is_deleted: processBoolean(processedParams.is_deleted)
        };
    }

    /**
     * Lấy danh sách phòng ban của một manager
     */
    public async getManagerDepartments(managerId: string, queryParams: any = {}): Promise<{
        departments: IDepartment[];
        count: number;
    }> {
        // Kiểm tra managerId có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(managerId)) {
            throw new HttpException(HttpStatus.BadRequest, 'The manager ID is invalid');
        }

        // Kiểm tra manager có tồn tại không
        const manager = await this.userSchema.findById(managerId);
        if (!manager) {
            throw new HttpException(HttpStatus.NotFound, 'Manager not found');
        }

        // Xử lý các tham số truy vấn
        const { is_deleted } = this.processQueryParams(queryParams);

        // Xây dựng truy vấn
        // Đảm bảo đang tìm kiếm theo manager_id trong database
        const query: any = { manager_id: managerId };

        // Xử lý trạng thái is_deleted
        if (is_deleted !== undefined) {
            query.is_deleted = is_deleted;
        } else {
            // Mặc định chỉ hiển thị các phòng ban chưa bị xóa logic
            query.is_deleted = false;
        }

        // Lấy danh sách phòng ban và đếm số lượng
        const departments = await this.departmentSchema
            .find(query)
            .populate('manager_id', 'first_name last_name email');

        return {
            departments,
            count: departments.length
        };
    }

    /**
     * Đếm tổng số phòng ban trong hệ thống 
     */
    public async countDepartments(queryParams: any = {}): Promise<number> {
        // Xử lý các tham số truy vấn
        const { is_deleted } = this.processQueryParams(queryParams);

        // Xây dựng truy vấn
        const query: any = {};

        // Xử lý trạng thái is_deleted
        if (is_deleted !== undefined) {
            query.is_deleted = is_deleted;
        } else {
            // Mặc định chỉ đếm các phòng ban chưa bị xóa logic
            query.is_deleted = false;
        }

        // Đếm số lượng phòng ban
        return await this.departmentSchema.countDocuments(query);
    }
}