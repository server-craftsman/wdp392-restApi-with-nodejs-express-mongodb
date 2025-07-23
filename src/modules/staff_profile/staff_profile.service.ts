import mongoose, { Schema } from "mongoose";
import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { SearchPaginationResponseModel } from "../../core/models";
import { IStaffProfile, StaffStatus } from "./staff_profile.interface";
import { StaffStatusEnum } from "./staff_profile.enum";
import { SlotStatusEnum } from "../slot/slot.enum";
import SlotSchema from "../slot/slot.model";
import DepartmentSchema from "../department/department.model";
import UserSchema from "../user/user.model";
import CreateStaffProfileDto from "./dtos/createStaffProfile.dto";
import UpdateStaffProfileDto from "./dtos/updateStaffProfile.dto";
import { isEmptyObject } from "../../core/utils";
import { UserRoleEnum } from "../user/user.enum";
import StaffProfileRepository from './staff_profile.repository';

export default class StaffProfileService {
    private staffProfileRepository = new StaffProfileRepository();
    private departmentSchema = DepartmentSchema;
    private userSchema = UserSchema;
    private slotSchema = SlotSchema;

    /**
     * Tạo hồ sơ nhân viên mới
     */
    public async createStaffProfile(model: CreateStaffProfileDto): Promise<IStaffProfile> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Data is required');
        }

        // Kiểm tra user_id có tồn tại và có role STAFF hoặc LABORATORY TECHNICIAN  
        const user = await this.userSchema.findById(model.user_id);
        if (!user || user.role !== UserRoleEnum.STAFF && user.role !== UserRoleEnum.LABORATORY_TECHNICIAN) {
            throw new HttpException(HttpStatus.BadRequest, 'User does not exist or does not have Staff or Laboratory Technician role');
        }

        // Kiểm tra user đã có hồ sơ nhân viên chưa
        const existingProfile = await this.staffProfileRepository.findOne({ user_id: model.user_id });
        if (existingProfile) {
            throw new HttpException(HttpStatus.Conflict, 'User already has a staff profile');
        }

        // Kiểm tra department_id có tồn tại
        const department = await this.departmentSchema.findById(model.department_id);
        if (!department || department.is_deleted) {
            throw new HttpException(HttpStatus.BadRequest, 'Department does not exist');
        }

        // Tạo employee_id duy nhất
        const employeeId = await this.generateEmployeeId();

        // Nếu model.address là string, chuyển đổi thành object
        if (typeof model.address === 'string') {
            model.address = JSON.parse(model.address);
        }

        // Nếu model.address chưa có, tự động lấy từ address đầy đủ của user
        let address = model.address;
        if (!address && user.address) {
            address = {
                street: user.address.street,
                ward: user.address.ward,
                district: user.address.district,
                city: user.address.city,
                country: user.address.country
            };
        }

        // Tạo hồ sơ nhân viên mới với các giá trị mặc định
        const newProfile = await this.staffProfileRepository.createStaffProfile({
            ...model,
            user_id: model.user_id,
            department_id: model.department_id,
            employee_id: employeeId,
            status: StaffStatusEnum.ACTIVE,
            salary: model.salary || 0,
            qualifications: model.qualifications || [],
            address: address,
            created_at: new Date(),
            updated_at: new Date()
        });

        return newProfile;
    }

    /**
     * Tạo employee_id duy nhất 
     */
    private async generateEmployeeId(): Promise<string> {
        const prefix = 'EMP';
        const currentYear = new Date().getFullYear().toString().substr(-2);

        // Đếm số nhân viên đã tạo trong năm hiện tại
        const count = await this.staffProfileRepository.countDocuments({
            employee_id: { $regex: `^${prefix}${currentYear}` }
        });

        // Format: EMP23001, EMP23002, ...
        let sequenceNumber = (count + 1).toString().padStart(3, '0');
        let employeeId = `${prefix}${currentYear}${sequenceNumber}`;

        // Kiểm tra xem ID đã tồn tại chưa để đảm bảo tính duy nhất
        let existingProfile = await this.staffProfileRepository.findOne({ employee_id: employeeId });
        while (existingProfile) {
            // Nếu ID đã tồn tại, tăng số thứ tự và thử lại
            sequenceNumber = (parseInt(sequenceNumber) + 1).toString().padStart(3, '0');
            employeeId = `${prefix}${currentYear}${sequenceNumber}`;
            existingProfile = await this.staffProfileRepository.findOne({ employee_id: employeeId });
        }

        return employeeId;
    }

    /**
     * Tìm kiếm hồ sơ nhân viên với bộ lọc
     */
    public async getStaffProfiles(queryParams: any = {}): Promise<SearchPaginationResponseModel<IStaffProfile>> {
        try {
            // Xử lý tham số truy vấn
            const {
                pageNum,
                pageSize,
                sort_by,
                sort_order,
                department_id,
                status,
                keyword,
                address,
                hire_date_from,
                hire_date_to
            } = this.processQueryParams(queryParams);

            const skip = (pageNum - 1) * pageSize;

            // Xây dựng truy vấn
            const query: any = {};

            // Lọc theo phòng ban
            if (department_id) {
                query.department_id = department_id;
            }

            // Lọc theo trạng thái
            if (status) {
                query.status = status;
            }

            // Lọc theo ngày tuyển dụng
            if (hire_date_from || hire_date_to) { // Nếu có ngày tuyển dụng từ hoặc đến
                query.hire_date = {}; // Khởi tạo đối tượng ngày tuyển dụng
                if (hire_date_from) {
                    query.hire_date.$gte = new Date(hire_date_from); // hire_date >= hire_date_from
                }
                if (hire_date_to) {
                    const endDate = new Date(hire_date_to);
                    endDate.setHours(23, 59, 59, 999); // Đặt giờ, phút, giây, mili giây là 23:59:59.999
                    query.hire_date.$lte = endDate; // hire_date <= hire_date_to
                }
            }

            // Tìm kiếm theo từ khóa
            if (keyword) {
                query.$or = [
                    { employee_id: { $regex: keyword, $options: 'i' } },
                    { job_title: { $regex: keyword, $options: 'i' } },
                ];
            }

            // Lọc theo address
            if (address) {
                if (typeof address === 'string') {
                    // Nếu là string, tìm trên tất cả các trường address
                    query.$or = [
                        { 'address.street': { $regex: address, $options: 'i' } },
                        { 'address.ward': { $regex: address, $options: 'i' } },
                        { 'address.district': { $regex: address, $options: 'i' } },
                        { 'address.city': { $regex: address, $options: 'i' } },
                        { 'address.country': { $regex: address, $options: 'i' } }
                    ];
                } else if (typeof address === 'object') {
                    // Nếu là object, tìm theo từng trường nếu có
                    Object.entries(address).forEach(([key, value]) => {
                        if (value) {
                            query[`address.${key}`] = { $regex: value, $options: 'i' };
                        }
                    });
                }
            }

            // Đếm tổng số nhân viên
            const totalItems = await this.staffProfileRepository.countDocuments(query);

            // Xử lý sắp xếp
            const sortOptions: any = {};
            sortOptions[sort_by] = sort_order === 'asc' ? 1 : -1;

            // Lấy dữ liệu với phân trang và populate
            const staffProfiles = await this.staffProfileRepository.findWithPopulate(query, sortOptions, skip, pageSize);

            const totalPages = Math.ceil(totalItems / pageSize);

            return {
                pageData: staffProfiles,
                pageInfo: {
                    totalItems,
                    totalPages,
                    pageNum,
                    pageSize
                }
            };
        } catch (error) {
            console.error('Error in getStaffProfiles:', error);
            throw error;
        }
    }

    /**
     * Lấy nhân viên theo phòng ban
     */
    public async getStaffProfilesByDepartment(departmentId: string, queryParams: any = {}): Promise<SearchPaginationResponseModel<IStaffProfile>> {
        // Kiểm tra department_id hợp lệ
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid department ID');
        }

        const department = await this.departmentSchema.findById(departmentId);
        if (!department) {
            throw new HttpException(HttpStatus.NotFound, 'Department does not exist');
        }

        // Thêm department_id vào query params và gọi lại hàm getStaffProfiles
        const newQueryParams = { ...queryParams, department_id: departmentId };
        return this.getStaffProfiles(newQueryParams);
    }

    /**
     * Lấy nhân viên theo id
     */
    public async getStaffProfileById(id: string): Promise<IStaffProfile> {
        const staffProfile = await this.staffProfileRepository.findByIdWithPopulate(id);
        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }
        return staffProfile;
    }

    /**
     * Cập nhật hồ sơ nhân viên
     */
    public async updateStaffProfile(id: string, model: UpdateStaffProfileDto): Promise<IStaffProfile> {
        // Kiểm tra hồ sơ tồn tại
        const staffProfile = await this.staffProfileRepository.findById(id);
        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }

        // kiểm tra department_id có tồn tại, nếu không thay đổi thì lấy department_id cũ
        if (model.department_id) {
            const department = await this.departmentSchema.findById(model.department_id);
            if (!department) {
                throw new HttpException(HttpStatus.NotFound, 'Department does not exist');
            }
        }

        // Nếu model.address là string, chuyển đổi thành object
        if (typeof model.address === 'string') {
            model.address = JSON.parse(model.address);
        }

        // Nếu model.zone chưa có, tự động lấy từ address đầy đủ của user
        let address = model.address;
        if (!address && typeof staffProfile.user_id === 'string' && staffProfile.user_id !== null) {
            // Fetch the user object by id
            const user = await this.userSchema.findById(staffProfile.user_id);
            if (user && user.address) {
                address = {
                    street: user.address.street,
                    ward: user.address.ward,
                    district: user.address.district,
                    city: user.address.city,
                    country: user.address.country
                };
            }
        }

        // Cập nhật thông tin hồ sơ
        const updatedProfile = await this.staffProfileRepository.findByIdAndUpdate(
            id,
            {
                ...model,
                // user_id: model.user_id,
                department_id: model.department_id,
                address: model.address,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }

        return updatedProfile;
    }

    /**
     * Thay đổi trạng thái nhân viên
     */
    public async changeStaffStatus(id: string, status: StaffStatus): Promise<IStaffProfile> {
        // Kiểm tra hồ sơ tồn tại
        const staffProfile = await this.staffProfileRepository.findById(id);
        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }

        // Kiểm tra trạng thái có hợp lệ không
        if (!Object.values(StaffStatusEnum).includes(status)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid status');
        }

        // Nếu chuyển sang TERMINATED, hủy tất cả slot trong tương lai
        if (status === StaffStatusEnum.TERMINATED) {
            const currentDate = new Date();
            await this.slotSchema.updateMany(
                {
                    staff_profile_id: id,
                    start_time: { $gt: currentDate }, // start_time > currentDate
                    status: SlotStatusEnum.AVAILABLE // status = AVAILABLE
                },
                { status: SlotStatusEnum.UNAVAILABLE } // status = UNAVAILABLE
            );
        }

        // Cập nhật trạng thái
        const updatedProfile = await this.staffProfileRepository.findByIdAndUpdate(
            id,
            { status, updated_at: new Date() },
            { new: true }
        );

        if (!updatedProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }

        return updatedProfile;
    }

    /**
     * Xử lý tham số truy vấn
     */
    private processQueryParams(params: any): {
        pageNum: number;
        pageSize: number;
        sort_by: string;
        sort_order: string;
        department_id?: string;
        status?: string;
        keyword?: string;
        address?: string;
        hire_date_from?: string;
        hire_date_to?: string;
    } {
        return {
            pageNum: params.pageNum || 1,
            pageSize: params.pageSize || 10,
            sort_by: params.sort_by || 'created_at',
            sort_order: params.sort_order || 'desc',
            department_id: params.department_id,
            status: params.status,
            keyword: params.keyword,
            address: params.address,
            hire_date_from: params.hire_date_from,
            hire_date_to: params.hire_date_to
        };
    }

}