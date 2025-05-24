import mongoose from "mongoose";
import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
// import { IError } from "../../core/interfaces";
import { SearchPaginationResponseModel } from "../../core/models";
import SlotSchema from "./slot.model";
import StaffProfileSchema from "../staff_profile/staff_profile.model";
import { StaffStatusEnum } from "../staff_profile/staff_profile.enum";
import { SlotStatusEnum } from "./slot.enum";
import { ISlot, SlotPattern } from "./slot.interface";
import { CreateMultipleSlotsDto } from "./dtos/createMultipleSlots.dto";
import { UpdateSlotDto } from "./dtos/updateSlot.dto";
import { CreateSlotDto } from "./dtos/createSlot.dto";
import { UserRoleEnum } from "../user/user.enum";
import ServiceSchema from "../service/service.model";
import { ServiceTypeEnum, SampleMethodEnum } from "../service/service.enum";

export default class SlotService {
    private slotSchema = SlotSchema;
    private staffProfileSchema = StaffProfileSchema;
    private serviceSchema = ServiceSchema;
    // private errorResults: IError[] = [];

    /**
     * Tạo nhiều slot cùng lúc theo mẫu
     */
    // public async createMultipleSlots(model: CreateMultipleSlotsDto): Promise<{
    //     created: number,
    //     skipped: number
    // }> {
    //     // Kiểm tra staff_profile_id hợp lệ
    //     const staffProfile = await this.staffProfileSchema.findById(model.staff_profile_id);
    //     if (!staffProfile) {
    //         this.errorResults.push({
    //             message: 'Staff profile not found',
    //             field: 'staff_profile_id'
    //         });
    //     }

    //     if (staffProfile && staffProfile.status !== StaffStatusEnum.ACTIVE) {
    //         this.errorResults.push({
    //             message: 'Staff is not active',
    //             field: 'staff_profile_id'
    //         });
    //     }

    //     // Kiểm tra time_slots hợp lệ
    //     for (const timeSlot of model.time_slots) {
    //         const startTime = timeSlot.start_hour * 60 + timeSlot.start_minute; // convert start time to minutes
    //         const endTime = timeSlot.end_hour * 60 + timeSlot.end_minute; // convert end time to minutes

    //         if (endTime <= startTime) {
    //             this.errorResults.push({
    //                 message: `Invalid time slot: ${timeSlot.start_hour}:${timeSlot.start_minute} - ${timeSlot.end_hour}:${timeSlot.end_minute}. End time must be after start time.`,
    //                 field: 'time_slots'
    //             });
    //         }
    //     }

    //     // Tạo danh sách slots dựa trên pattern
    //     const slotTimes: { start: Date, end: Date }[] = []; // create an array of objects with start and end dates

    //     // Tạo slots theo pattern
    //     if (model.pattern === SlotPattern.DAILY) {
    //         // Tạo slot mỗi ngày trong khoảng từ start_date đến end_date
    //         for (let d = new Date(model.start_date); d <= new Date(model.end_date); d.setDate(d.getDate() + 1)) { //loop through each day in the range
    //             for (const time of model.time_slots) { // sử dụng time_slots để tạo slot cho từng ngày
    //                 const startDate = new Date(d); // tạo ngày bắt đầu cho slot
    //                 startDate.setHours(time.start_hour, time.start_minute, 0, 0); // set the start time of the slot

    //                 const endDate = new Date(d); // tạo ngày kết thúc cho slot
    //                 endDate.setHours(time.end_hour, time.end_minute, 0, 0); // set the end time of the slot

    //                 // xử lý time_slots qua đêm
    //                 // Nếu thời gian kết thúc nhỏ hơn thời gian bắt đầu, thêm 1 ngày vào thời gian kết thúc
    //                 if (endDate < startDate) {
    //                     endDate.setDate(endDate.getDate() + 1);
    //                 }

    //                 slotTimes.push({ start: startDate, end: endDate }); // thêm slot vào danh sách
    //             }
    //         }
    //     } else if (model.pattern === SlotPattern.WEEKLY) {
    //         // Tạo slot hàng tuần cho các ngày được chọn
    //         for (let d = new Date(model.start_date); d <= new Date(model.end_date); d.setDate(d.getDate() + 1)) { //loop through each day in the range
    //             // Kiểm tra ngày trong tuần có được chọn không
    //             if (model.days_of_week.includes(d.getDay())) {
    //                 for (const time of model.time_slots) { // sử dụng time_slots để tạo slot cho từng ngày
    //                     const startDate = new Date(d); // tạo ngày bắt đầu cho slot
    //                     startDate.setHours(time.start_hour, time.start_minute, 0, 0); // set the start time of the slot

    //                     const endDate = new Date(d);
    //                     endDate.setHours(time.end_hour, time.end_minute, 0, 0); // set the end time of the slot

    //                     // xử lý time_slots qua đêm
    //                     // Nếu thời gian kết thúc nhỏ hơn thời gian bắt đầu, thêm 1 ngày vào thời gian kết thúc
    //                     if (endDate < startDate) {
    //                         endDate.setDate(endDate.getDate() + 1);
    //                     }

    //                     slotTimes.push({ start: startDate, end: endDate }); // thêm slot vào danh sách
    //                 }
    //             }
    //         }
    //     }

    //     // Kiểm tra trùng lặp và tạo slot
    //     let created = 0;
    //     let skipped = 0;

    //     for (const time of slotTimes) {
    //         // Kiểm tra slot đã tồn tại chưa
    //         const existingSlot = await this.slotSchema.findOne({
    //             staff_profile_id: model.staff_profile_id,
    //             $or: [
    //                 {
    //                     start_time: { $lt: time.end }, // start_time nhỏ hơn end_time
    //                     end_time: { $gt: time.start } // end_time lớn hơn start_time
    //                 }
    //             ]
    //         });

    //         if (existingSlot) { // nếu slot đã tồn tại
    //             skipped++; // tăng số lượng slot bị bỏ qua
    //             continue; // tiếp tục vòng lặp
    //         }

    //         // kiểm tra time_slots, days_of_week có phải là Array không
    //         if (!Array.isArray(model.time_slots) && !Array.isArray(model.days_of_week)) {
    //             this.errorResults.push({
    //                 message: 'time_slots and days_of_week must be an array',
    //                 field: 'time_slots'
    //             });
    //         }

    //         // Tạo slot mới
    //         await this.slotSchema.create({
    //             staff_profile_id: model.staff_profile_id,
    //             service_id: model.service_id,
    //             pattern: model.pattern || SlotPattern.DAILY,
    //             start_time: time.start,
    //             end_time: time.end,
    //             appointment_limit: model.appointment_limit || 1,
    //             days_of_week: model.days_of_week || [],
    //             time_slots: model.time_slots || [],
    //             status: SlotStatusEnum.AVAILABLE,
    //             created_at: new Date(),
    //             updated_at: new Date()
    //         });

    //         created++; // Tăng số lượng slot đã tạo thành công để trả về cho người dùng
    //     }

    //     return { created, skipped }; // trả về số lượng slot đã tạo thành công và số lượng slot bị bỏ qua
    // }

    /**
     * Lấy slots theo phòng ban và khoảng thời gian
     */
    public async getSlotsByDepartment(departmentId: string, queryParams: any = {}): Promise<SearchPaginationResponseModel<ISlot>> {
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Department ID is invalid');
        }

        // Tìm tất cả nhân viên thuộc phòng ban
        const staffProfiles = await this.staffProfileSchema.find({
            department_id: departmentId,
            status: StaffStatusEnum.ACTIVE
        });

        const staffProfileIds = staffProfiles.map(profile => profile._id); // lấy danh sách id của nhân viên thuộc phòng ban

        // Xử lý tham số truy vấn
        const {
            pageNum,
            pageSize,
            date_from,
            date_to,
            status,
            staff_profile_ids
        } = this.processQueryParams(queryParams);

        const skip = (pageNum - 1) * pageSize; // tính toán số lượng slot bị bỏ qua

        // Xây dựng truy vấn
        const query: any = {};

        // Lọc theo staff_profile_ids hoặc tất cả nhân viên trong phòng ban
        if (staff_profile_ids) {
            query.staff_profile_ids = staff_profile_ids;
        } else {
            query.staff_profile_ids = { $in: staffProfileIds }; // $in is used in array to filter the some of the values
        }

        // Lọc theo trạng thái
        if (status) {
            query.status = status;
        }

        // Lọc theo khoảng thời gian
        if (date_from || date_to) {
            if (date_from) {
                const startDate = new Date(date_from);
                query.start_time = { $gte: startDate }; // start_time >= date_from
            }
            if (date_to) {
                const endDate = new Date(date_to);
                endDate.setHours(23, 59, 59, 999); // set the end time of the slot
                if (query.start_time) {
                    query.start_time.$lte = endDate; // start_time <= end_time
                } else {
                    query.start_time = { $lte: endDate }; // start_time <= end_time
                }
            }
        }

        // Đếm tổng số slot
        const totalItems = await this.slotSchema.countDocuments(query);

        // Lấy dữ liệu với phân trang
        const slots = await this.slotSchema
            .find(query) // tìm kiếm slot theo query
            .sort({ start_time: 1 }) // sắp xếp theo start_time tăng dần
            .skip(skip) // bỏ qua skip số lượng slot
            .limit(pageSize) // giới hạn số lượng slot trả về
            .populate({
                path: 'staff_profile_ids',
                select: 'employee_id job_title',
                populate: {
                    path: 'user_id',
                    select: 'first_name last_name'
                }
            });

        const totalPages = Math.ceil(totalItems / pageSize);

        return {
            pageData: slots,
            pageInfo: {
                totalItems,
                totalPages,
                pageNum,
                pageSize
            }
        };
    }

    /**
     * Cập nhật slot
     */
    public async updateSlot(id: string, model: UpdateSlotDto): Promise<ISlot> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid slot ID');
        }

        const slot = await this.slotSchema.findById(id);
        if (!slot) {
            throw new HttpException(HttpStatus.NotFound, 'Slot not found');
        }

        // Validate time range
        if (new Date(model.start_time) >= new Date(model.end_time)) {
            throw new HttpException(HttpStatus.BadRequest, 'Start time must be before end time');
        }

        // Validate staff profiles
        const staffProfiles = await this.staffProfileSchema.find({
            _id: { $in: model.staff_profile_ids }, // $in is used in array to filter the some of the values
            status: StaffStatusEnum.ACTIVE
        });

        // kiểm tra pattern có hợp lệ hay không
        if (model.pattern && model.pattern !== SlotPattern.DAILY && model.pattern !== SlotPattern.WEEKLY) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid pattern');
        }

        if (staffProfiles.length === 0) {
            throw new HttpException(HttpStatus.NotFound, 'No active staff profiles found');
        }

        const staffProfileIds = staffProfiles.map(profile => profile._id);

        // Check for overlapping slots (excluding the current slot)
        const overlappingSlots = await this.slotSchema.findOne({
            _id: { $ne: id }, // không tính chính nó - $ne is not equal to
            staff_profile_ids: { $in: model.staff_profile_ids },
            $or: [
                {
                    start_time: { $lt: model.end_time, $gte: model.start_time }, // start_time nhỏ hơn end_time và lớn hơn start_time
                    end_time: { $gt: model.start_time, $lte: model.end_time } // end_time lớn hơn start_time và nhỏ hơn end_time
                }
            ]
        });

        // kiểm tra xem slot có bị trùng lặp với slot khác hay không, BỎ QUA NẾU TRÙNG VỚI CHÍNH NÓ
        if (overlappingSlots) {
            throw new HttpException(HttpStatus.Conflict, 'Slot overlaps with an existing slot');
        }

        // kiểm tra xem staff_profile_ids có hợp lệ hay không
        if (model.staff_profile_ids.length !== staffProfileIds.length) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid staff profile IDs');
        }

        // Update the slot
        const updatedSlot = await this.slotSchema.findByIdAndUpdate(
            id,
            {
                staff_profile_ids: staffProfileIds,
                service_id: model.service_id,
                start_time: model.start_time,
                end_time: model.end_time,
                appointment_limit: model.appointment_limit,
                pattern: model.pattern,
                days_of_week: model.days_of_week,
                status: model.status,
                updated_at: new Date()
            },
            { new: true }
        ).populate({
            path: 'staff_profile_ids',
            select: 'employee_id job_title',
            populate: {
                path: 'user_id',
                select: 'first_name last_name'
            }
        });

        if (!updatedSlot) {
            throw new HttpException(HttpStatus.NotFound, 'Slot not found after update');
        }

        return updatedSlot;
    }

    private processQueryParams(queryParams: any): any {
        const { pageNum = 1, pageSize = 10, ...rest } = queryParams;
        return {
            pageNum: parseInt(pageNum),
            pageSize: parseInt(pageSize),
            ...rest
        };
    }

    /**
     * Tạo một slot mới
     */
    public async createSlot(model: CreateSlotDto): Promise<ISlot> {
        if (!model.start_time || !model.end_time || model.start_time >= model.end_time) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid slot time range');
        }

        const staffProfiles = await this.staffProfileSchema.find({
            _id: { $in: model.staff_profile_ids || [] },
            status: StaffStatusEnum.ACTIVE
        });

        if (staffProfiles.length === 0) {
            throw new HttpException(HttpStatus.NotFound, 'No active staff profiles found');
        }

        const staffProfileIds = staffProfiles.map(profile => profile._id);

        // Check for overlapping slots for the given staff profiles
        const overlappingSlots = await this.slotSchema.find({
            staff_profile_ids: { $in: staffProfileIds },
            $or: [
                {
                    start_time: { $lt: model.end_time }, // start_time nhỏ hơn end_time
                    end_time: { $gt: model.start_time } // end_time lớn hơn start_time
                }
            ]
        });

        if (overlappingSlots.length > 0) {
            throw new HttpException(HttpStatus.Conflict, 'Slot overlaps with an existing slot');
        }

        // Create a new slot for the first active staff profile
        const newSlot = await this.slotSchema.create({
            ...model,
            staff_profile_ids: staffProfileIds,
            status: SlotStatusEnum.AVAILABLE,
            created_at: new Date(),
            updated_at: new Date()
        });

        return newSlot;
    }

    /**
     * Lấy danh sách slot với các bộ lọc
     */
    public async getSlots(queryParams: any = {}): Promise<SearchPaginationResponseModel<ISlot>> {
        try {
            // Xử lý tham số truy vấn
            const {
                pageNum,
                pageSize,
                staff_profile_ids,
                department_id,
                status,
                date_from,
                date_to
            } = this.processQueryParams(queryParams);

            const skip = (pageNum - 1) * pageSize;

            // Xây dựng truy vấn
            const query: any = {};

            // Lọc theo staff_profile_ids
            if (staff_profile_ids) {
                query.staff_profile_ids = staff_profile_ids;
            }

            // Lọc theo phòng ban của nhân viên
            if (department_id) {
                // Tìm tất cả nhân viên thuộc phòng ban & trạng thái ACTIVE
                const staffProfiles = await this.staffProfileSchema.find({
                    department_id,
                    status: StaffStatusEnum.ACTIVE
                });

                const staffProfileIds = staffProfiles.map(profile => profile._id); // lấy danh sách id của nhân viên thuộc phòng ban
                query.staff_profile_ids = { $in: staffProfileIds }; // $in is used in array to filter the some of the values
            }

            // Lọc theo trạng thái
            if (status) {
                query.status = status;
            }

            // Lọc theo khoảng thời gian
            if (date_from || date_to) {
                if (date_from) {
                    const startDate = new Date(date_from); // tạo ngày bắt đầu
                    query.start_time = { $gte: startDate }; // start_time >= date_from
                }
                if (date_to) {
                    const endDate = new Date(date_to); // tạo ngày kết thúc
                    endDate.setHours(23, 59, 59, 999); // set the end time of the slot
                    if (query.start_time) {
                        query.start_time.$lte = endDate; // start_time <= end_time
                    } else {
                        query.start_time = { $lte: endDate }; // start_time <= end_time
                    }
                }
            }

            // Đếm tổng số slot
            const totalItems = await this.slotSchema.countDocuments(query);

            // Lấy dữ liệu với phân trang
            const slots = await this.slotSchema
                .find(query) // tìm kiếm slot theo query
                .sort({ start_time: 1 })
                .skip(skip)
                .limit(pageSize)
                .populate({
                    path: 'staff_profile_ids',
                    select: 'employee_id job_title',
                    populate: {
                        path: 'user_id',
                        select: 'first_name last_name'
                    }
                });

            const totalPages = Math.ceil(totalItems / pageSize); // tính toán số lượng trang

            return {
                pageData: slots,
                pageInfo: {
                    totalItems,
                    totalPages,
                    pageNum,
                    pageSize
                }
            };
        } catch (error) {
            console.error('Error in getSlots:', error);
            throw error;
        }
    }

    /**
     * Lấy slot theo ID
     */
    public async getSlotById(id: string): Promise<ISlot> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid slot ID');
        }

        const slot = await this.slotSchema.findById(id)
            .populate({
                path: 'staff_profile_ids',
                select: 'employee_id job_title',
                populate: {
                    path: 'user_id',
                    select: 'first_name last_name'
                }
            })
            .exec();

        if (slot && Array.isArray(slot.staff_profile_ids)) {
            slot.staff_profile_ids = slot.staff_profile_ids.map((staffProfile: any) => staffProfile.toString());
        }

        if (!slot) {
            throw new HttpException(HttpStatus.NotFound, 'Slot not found');
        }

        return slot as ISlot;
    }

    /**
     * Thay đổi trạng thái slot
     */
    public async changeSlotStatus(id: string, status: string): Promise<ISlot> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid slot ID');
        }

        const slot = await this.slotSchema.findById(id);
        if (!slot) {
            throw new HttpException(HttpStatus.NotFound, 'Slot not found');
        }

        // Không cho phép thay đổi trạng thái nếu slot đã BOOKED (có trong db) và param status không phải là BOOKED
        if (slot && slot.status === SlotStatusEnum.BOOKED && status !== SlotStatusEnum.BOOKED) {
            throw new HttpException(HttpStatus.BadRequest, 'Cannot change status of a booked slot');
        }

        // Chỉ chấp nhận các trạng thái hợp lệ
        if (![SlotStatusEnum.AVAILABLE, SlotStatusEnum.UNAVAILABLE, SlotStatusEnum.BOOKED].includes(status as any)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid status value');
        }

        const updatedSlot = await this.slotSchema.findByIdAndUpdate(
            id,
            {
                status: status,
                updated_at: new Date()
            },
            { new: true }
        ).populate({
            path: 'staff_profile_ids',
            select: 'employee_id job_title',
            populate: {
                path: 'user_id',
                select: 'first_name last_name'
            }
        });

        if (!updatedSlot) {
            throw new HttpException(HttpStatus.NotFound, 'Slot not found');
        }

        return updatedSlot as ISlot;
    }

    /**
     * Lấy slots theo nhân viên
     */
    public async getSlotsByStaff(staffProfileId: string, queryParams: any = {}): Promise<SearchPaginationResponseModel<ISlot>> {
        if (!mongoose.Types.ObjectId.isValid(staffProfileId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid staff profile ID');
        }

        const staffProfile = await this.staffProfileSchema.findById(staffProfileId);
        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found');
        }

        if (staffProfile && staffProfile.status !== StaffStatusEnum.ACTIVE) {
            throw new HttpException(HttpStatus.BadRequest, 'Staff is not active');
        }

        // Thêm staff_profile_id vào query params và gọi lại hàm getSlots
        const newQueryParams = { ...queryParams, staff_profile_id: staffProfileId };
        return await this.getSlots(newQueryParams);
    }

    /**
     * Lấy slots theo dịch vụ
     */
    public async getSlotsByService(serviceId: string, queryParams: any = {}): Promise<SearchPaginationResponseModel<ISlot>> {
        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid service ID');
        }

        const service = await this.serviceSchema.findById(serviceId);
        if (!service) {
            throw new HttpException(HttpStatus.NotFound, 'Service not found');
        }

        // Thêm service_id vào query params và gọi lại hàm getSlots
        const newQueryParams = { ...queryParams, service_id: serviceId };
        return await this.getSlots(newQueryParams);
    }

    /**
     * Lấy thống kê performance của phòng ban
     */
    public async getDepartmentPerformance(departmentId: string, queryParams: any): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid department ID');
        }

        // Find all active staff profiles in the department
        const staffProfiles = await this.staffProfileSchema.find({
            department_id: departmentId,
            status: StaffStatusEnum.ACTIVE
        });

        const staffProfileIds = staffProfiles.map(profile => profile._id);

        // Process query parameters
        const { date_from, date_to } = queryParams;
        const query: any = { staff_profile_ids: { $in: staffProfileIds } };

        // Filter by date range
        if (date_from || date_to) {
            query.start_time = {};
            if (date_from) {
                query.start_time.$gte = new Date(date_from);
            }
            if (date_to) {
                const endDate = new Date(date_to);
                endDate.setHours(23, 59, 59, 999);
                query.start_time.$lte = endDate;
            }
        }

        // Count total slots
        const totalSlots = await this.slotSchema.countDocuments(query);

        // Count booked slots
        const bookedSlots = await this.slotSchema.countDocuments({
            ...query,
            status: SlotStatusEnum.BOOKED
        });

        // Calculate booking rate (số lượng slot đã được đặt / tổng số slot)
        const bookingRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

        return {
            totalStaff: staffProfiles.length,
            totalSlots,
            bookedSlots,
            bookingRate
        };
    }
}