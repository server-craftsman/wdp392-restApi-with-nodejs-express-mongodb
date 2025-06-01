import mongoose, { Schema } from "mongoose";
import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
// import { IError } from "../../core/interfaces";
import { SearchPaginationResponseModel } from "../../core/models";
import SlotSchema from "./slot.model";
import StaffProfileSchema from "../staff_profile/staff_profile.model";
import { StaffStatusEnum } from "../staff_profile/staff_profile.enum";
import { SlotStatusEnum } from "./slot.enum";
import { ISlot } from "./slot.interface";
import { UpdateSlotDto } from "./dtos/updateSlot.dto";
import { CreateSlotDto } from "./dtos/createSlot.dto";
import { UserRoleEnum } from "../user/user.enum";
import ServiceSchema from "../service/service.model";
import { ServiceTypeEnum, SampleMethodEnum } from "../service/service.enum";
import SlotRepository from "./slot.repository";
import UserSchema from "../user/user.model";

export default class SlotService {
    private slotSchema = SlotSchema;
    private staffProfileSchema = StaffProfileSchema;
    private serviceSchema = ServiceSchema;
    private slotRepository = new SlotRepository();
    private userSchema = UserSchema;
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
     * Get slots by department with role-based filtering
     * @param departmentId Department ID
     * @param queryParams Query parameters
     * @param userRole Role of the requesting user
     * @param userId ID of the requesting user
     * @returns Paginated list of slots for the department
     */
    public async getSlotsByDepartment(
        departmentId: string,
        queryParams: any = {},
        userRole?: string,
        userId?: string
    ): Promise<SearchPaginationResponseModel<ISlot>> {
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Department ID is invalid');
        }

        // Find all staff profiles in the department
        const staffProfiles = await this.staffProfileSchema.find({
            department_id: departmentId,
            status: StaffStatusEnum.ACTIVE
        });

        const staffProfileIds = staffProfiles.map(profile => profile._id);

        // For staff users, check if they belong to the requested department
        if (userRole === UserRoleEnum.STAFF && userId) {
            const staffProfile = await this.staffProfileSchema.findOne({ user_id: userId });

            if (!staffProfile) {
                return {
                    pageData: [],
                    pageInfo: {
                        totalItems: 0,
                        totalPages: 0,
                        pageNum: 1,
                        pageSize: 10
                    }
                };
            }

            // Check if staff belongs to the requested department
            if (staffProfile.department_id?.toString() !== departmentId) {
                // Staff can only see slots from their own department
                throw new HttpException(HttpStatus.Forbidden, 'You can only view slots from your own department');
            }
        }

        // Add department_id to query params
        const enrichedQueryParams = {
            ...queryParams,
            department_id: departmentId
        };

        // Use the getSlots method with role-based filtering
        return this.getSlots(enrichedQueryParams, userRole, userId);
    }

    /**
     * Cập nhật slot
     */
    public async updateSlot(id: string, model: UpdateSlotDto): Promise<ISlot> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid slot ID');
        }

        const slot = await this.slotRepository.findById(id);
        if (!slot) {
            throw new HttpException(HttpStatus.NotFound, 'Slot not found');
        }

        if (!model.time_slots || model.time_slots.length === 0) {
            throw new HttpException(HttpStatus.BadRequest, 'time_slots are required');
        }

        for (const timeSlot of model.time_slots) {
            // kiểm tra xem time_slots có hợp lệ hay không
            if (!timeSlot.year || !timeSlot.month || !timeSlot.day ||
                !timeSlot.start_time || !timeSlot.end_time ||
                timeSlot.start_time.hour === undefined || timeSlot.start_time.minute === undefined ||
                timeSlot.end_time.hour === undefined || timeSlot.end_time.minute === undefined) {
                throw new HttpException(HttpStatus.BadRequest, 'All time slot fields are required');
            }

            // kiểm tra xem hour và minute có hợp lệ hay không
            if (timeSlot.start_time.hour < 0 || timeSlot.start_time.hour > 23 ||
                timeSlot.end_time.hour < 0 || timeSlot.end_time.hour > 23 ||
                timeSlot.start_time.minute < 0 || timeSlot.start_time.minute > 59 ||
                timeSlot.end_time.minute < 0 || timeSlot.end_time.minute > 59) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid hour or minute values');
            }

            // chuyển đổi sang phút để dễ so sánh
            const startTimeInMinutes = timeSlot.start_time.hour * 60 + timeSlot.start_time.minute;
            const endTimeInMinutes = timeSlot.end_time.hour * 60 + timeSlot.end_time.minute;

            // kiểm tra xem thời gian kết thúc có sau thời gian bắt đầu hay không
            if (endTimeInMinutes <= startTimeInMinutes) {
                throw new HttpException(HttpStatus.BadRequest, 'End time must be after start time');
            }

            // kiểm tra xem ngày có hợp lệ hay không
            const date = new Date(timeSlot.year, timeSlot.month - 1, timeSlot.day);
            if (isNaN(date.getTime()) || date.getDate() !== timeSlot.day) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid date');
            }
        }

        // kiểm tra xem staff_profile_ids có hợp lệ hay không
        const staffProfiles = await this.staffProfileSchema.find({
            _id: { $in: model.staff_profile_ids }, // $in is used in array to filter the some of the values
            status: StaffStatusEnum.ACTIVE
        });

        if (staffProfiles.length === 0) {
            throw new HttpException(HttpStatus.NotFound, 'No active staff profiles found');
        }

        const staffProfileIds = staffProfiles.map(profile => profile._id);

        // kiểm tra xem slot có bị trùng lặp với slot khác hay không, BỎ QUA NẾU TRÙNG VỚI CHÍNH NÓ
        for (const timeSlot of model.time_slots) {
            const overlappingSlots = await this.slotRepository.findOne({
                _id: { $ne: id }, // không tính chính nó - $ne is not equal to
                staff_profile_ids: { $in: model.staff_profile_ids },
                time_slots: {
                    $elemMatch: { // $elemMatch được sử dụng để tìm kiếm phần tử trong mảng
                        year: timeSlot.year,
                        month: timeSlot.month,
                        day: timeSlot.day,
                        $or: [
                            {
                                // thời gian bắt đầu nằm trong slot hiện tại
                                "start_time.hour": { $lt: timeSlot.end_time.hour }, // start_time.hour < end_time.hour
                                "end_time.hour": { $gt: timeSlot.start_time.hour } // end_time.hour > start_time.hour
                            },
                            {
                                // cùng giờ, kiểm tra phút
                                "start_time.hour": timeSlot.start_time.hour,
                                "start_time.minute": { $lt: timeSlot.end_time.minute }
                            },
                            {
                                // Same hour, check minutes
                                "end_time.hour": timeSlot.end_time.hour,
                                "end_time.minute": { $gt: timeSlot.start_time.minute }
                            }
                        ]
                    }
                }
            });

            // kiểm tra xem slot có bị trùng lặp với slot khác hay không, BỎ QUA NẾU TRÙNG VỚI CHÍNH NÓ
            if (overlappingSlots) {
                throw new HttpException(HttpStatus.Conflict, 'Slot overlaps with an existing slot');
            }
        }

        // kiểm tra xem staff_profile_ids có hợp lệ hay không
        if (model.staff_profile_ids.length !== staffProfileIds.length) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid staff profile IDs');
        }

        // cập nhật slot
        const updatedSlot = await this.slotRepository.findByIdAndUpdate(
            id,
            {
                staff_profile_ids: staffProfileIds,
                time_slots: model.time_slots as any, // ép kiểu sang any để khắc phục lỗi kiểu dữ liệu
                appointment_limit: model.appointment_limit,
                status: model.status,
                updated_at: new Date()
            },
            { new: true }
        );

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
        if (!model.time_slots || model.time_slots.length === 0) {
            throw new HttpException(HttpStatus.BadRequest, 'time_slots are required');
        }

        // Validate time slots
        for (const timeSlot of model.time_slots) {
            // kiểm tra xem tất cả các trường bắt buộc có tồn tại hay không
            if (!timeSlot.year || !timeSlot.month || !timeSlot.day ||
                !timeSlot.start_time || !timeSlot.end_time ||
                timeSlot.start_time.hour === undefined || timeSlot.start_time.minute === undefined ||
                timeSlot.end_time.hour === undefined || timeSlot.end_time.minute === undefined) {
                throw new HttpException(HttpStatus.BadRequest, 'All time slot fields are required');
            }

            // kiểm tra xem hour và minute có hợp lệ hay không
            if (timeSlot.start_time.hour < 0 || timeSlot.start_time.hour > 23 ||
                timeSlot.end_time.hour < 0 || timeSlot.end_time.hour > 23 ||
                timeSlot.start_time.minute < 0 || timeSlot.start_time.minute > 59 ||
                timeSlot.end_time.minute < 0 || timeSlot.end_time.minute > 59) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid hour or minute values');
            }

            // chuyển đổi sang phút để dễ so sánh
            const startTimeInMinutes = timeSlot.start_time.hour * 60 + timeSlot.start_time.minute;
            const endTimeInMinutes = timeSlot.end_time.hour * 60 + timeSlot.end_time.minute;

            // kiểm tra xem thời gian kết thúc có sau thời gian bắt đầu hay không
            if (endTimeInMinutes <= startTimeInMinutes) {
                throw new HttpException(HttpStatus.BadRequest, 'End time must be after start time');
            }

            // kiểm tra xem ngày có hợp lệ hay không
            const date = new Date(timeSlot.year, timeSlot.month - 1, timeSlot.day);
            if (isNaN(date.getTime()) || date.getDate() !== timeSlot.day) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid date');
            }
        }

        // kiểm tra xem staff_profile_ids có hợp lệ hay không
        const staffProfiles = await this.staffProfileSchema.find({
            _id: { $in: model.staff_profile_ids || [] },
            status: StaffStatusEnum.ACTIVE
        });

        if (staffProfiles.length === 0) {
            throw new HttpException(HttpStatus.NotFound, 'No active staff profiles found');
        }

        const staffProfileIds = staffProfiles.map(profile => profile._id);

        // kiểm tra xem slot có bị trùng lặp với slot khác hay không, BỎ QUA NẾU TRÙNG VỚI CHÍNH NÓ
        for (const timeSlot of model.time_slots) {
            // tạo ngày bắt đầu
            const startDate = new Date(timeSlot.year, timeSlot.month - 1, timeSlot.day);
            startDate.setHours(timeSlot.start_time.hour, timeSlot.start_time.minute, 0, 0);

            // tạo ngày kết thúc
            const endDate = new Date(timeSlot.year, timeSlot.month - 1, timeSlot.day);
            endDate.setHours(timeSlot.end_time.hour, timeSlot.end_time.minute, 0, 0);

            // kiểm tra xem slot có bị trùng lặp với slot khác hay không, BỎ QUA NẾU TRÙNG VỚI CHÍNH NÓ
            const overlappingSlots = await this.slotSchema.find({
                staff_profile_ids: { $in: staffProfileIds }, // $in is used in array to filter the some of the values
                time_slots: {
                    $elemMatch: { // $elemMatch được sử dụng để tìm kiếm phần tử trong mảng
                        year: timeSlot.year,
                        month: timeSlot.month,
                        day: timeSlot.day,
                        $or: [
                            {
                                // thời gian bắt đầu nằm trong slot hiện tại
                                "start_time.hour": { $lt: timeSlot.end_time.hour }, // start_time.hour < end_time.hour
                                "end_time.hour": { $gt: timeSlot.start_time.hour } // end_time.hour > start_time.hour
                            },
                            {
                                // cùng giờ, kiểm tra phút
                                "start_time.hour": timeSlot.start_time.hour,
                                "start_time.minute": { $lt: timeSlot.end_time.minute } // start_time.minute < end_time.minute
                            },
                            {
                                // cùng giờ, kiểm tra phút
                                "end_time.hour": timeSlot.end_time.hour,
                                "end_time.minute": { $gt: timeSlot.start_time.minute } // end_time.minute > start_time.minute
                            }
                        ]
                    }
                }
            });

            if (overlappingSlots.length > 0) {
                throw new HttpException(HttpStatus.Conflict, 'Slot overlaps with an existing slot');
            }
        }

        // tạo slot mới
        const newSlot = await this.slotSchema.create({
            staff_profile_ids: staffProfileIds,
            time_slots: model.time_slots,
            appointment_limit: model.appointment_limit,
            status: SlotStatusEnum.AVAILABLE,
            created_at: new Date(),
            updated_at: new Date()
        });

        return newSlot;
    }

    /**
     * Get slots with filters
     * @param queryParams Query parameters for filtering
     * @param userRole Role of the requesting user
     * @param userId ID of the requesting user
     * @returns Paginated list of slots
     */
    public async getSlots(queryParams: any = {}, userRole?: string, userId?: string): Promise<SearchPaginationResponseModel<ISlot>> {
        try {
            const {
                pageNum = 1,
                pageSize = 10,
                staff_profile_ids,
                department_id,
                appointment_id,
                status,
                date_from,
                date_to,
                sort_by = 'start_time',
                sort_order = 1,
            } = queryParams;

            const skip = (pageNum - 1) * pageSize;

            const query: any = {};

            // Lưu trữ staff_profile_ids được yêu cầu để lọc trong phản hồi sau
            let requestedStaffIds: string[] = [];

            // Xử lý lọc staff_profile_ids dựa trên vai trò của người dùng
            if (userRole === UserRoleEnum.STAFF) {
                if (staff_profile_ids) {
                    // Vai trò STAFF không được phép lọc bằng staff_profile_ids
                    throw new HttpException(HttpStatus.Forbidden, 'Staff role is not allowed to filter by staff_profile_id');
                }

                // STAFF chỉ có thể xem slot mà họ được giao
                if (userId) {
                    const staffProfile = await this.staffProfileSchema.findOne({ user_id: userId });
                    if (staffProfile) {
                        query.staff_profile_ids = { $in: [staffProfile._id] }; // $in is used in array to filter the some of the values
                        requestedStaffIds = [staffProfile._id.toString()];
                    } else {
                        // Nếu staff profile không được tìm thấy, trả về kết quả trống
                        return {
                            pageData: [],
                            pageInfo: {
                                totalItems: 0,
                                totalPages: 0,
                                pageNum: Number(pageNum),
                                pageSize: Number(pageSize)
                            }
                        };
                    }
                }
            } else if (userRole === UserRoleEnum.ADMIN || userRole === UserRoleEnum.MANAGER) {
                // Admin/Manager có thể lọc bằng staff_profile_ids nếu được cung cấp
                if (staff_profile_ids) {
                    // Chuyển đổi thành mảng nếu đó là ID duy nhất
                    const staffIdsArray: any[] = Array.isArray(staff_profile_ids)
                        ? staff_profile_ids
                        : [staff_profile_ids]; // ép kiểu sang mảng

                    // Chuyển đổi tất cả các ID thành chuỗi để so sánh
                    requestedStaffIds = staffIdsArray.map(id => id.toString());

                    // Sử dụng các giá trị gốc cho truy vấn
                    query.staff_profile_ids = { $in: staffIdsArray };
                }
                // Ngược lại, họ có thể xem tất cả các slot (không áp dụng bất kỳ lọc nào)
            }

            // Lọc theo department_id
            if (department_id) {
                const staffProfiles = await this.staffProfileSchema.find({
                    department_id,
                    status: StaffStatusEnum.ACTIVE
                });
                const staffProfileIds = staffProfiles.map(profile => profile._id.toString());

                // Nếu staff_profile_ids đã được thiết lập, sử dụng $and để kết hợp các bộ lọc
                if (query.staff_profile_ids) {
                    query.$and = [
                        { staff_profile_ids: query.staff_profile_ids },
                        { staff_profile_ids: { $in: staffProfileIds } }
                    ];

                    // Lọc requestedStaffIds để chỉ bao gồm nhân viên từ phòng ban này
                    if (requestedStaffIds.length > 0) {
                        requestedStaffIds = requestedStaffIds.filter(id =>
                            staffProfileIds.includes(id)
                        );
                    } else {
                        requestedStaffIds = staffProfileIds;
                    }

                    delete query.staff_profile_ids; // Xóa bộ lọc gốc vì chúng ta đang sử dụng $and
                } else {
                    query.staff_profile_ids = { $in: staffProfileIds };
                    requestedStaffIds = staffProfileIds;
                }
            }

            if (appointment_id) {
                query.appointment_id = appointment_id;
            }

            if (status) {
                query.status = status;
            }

            // Lọc theo khoảng ngày
            if (date_from || date_to) {
                // Tìm các slot mà bất kỳ thời gian_slot nào nằm trong khoảng ngày
                const dateConditions = [];

                if (date_from) {
                    const startDate = new Date(date_from);
                    const startYear = startDate.getFullYear();
                    const startMonth = startDate.getMonth() + 1; // JavaScript months are 0-based
                    const startDay = startDate.getDate();

                    dateConditions.push({
                        $or: [
                            { 'time_slots.year': { $gt: startYear } },
                            {
                                'time_slots.year': startYear,
                                'time_slots.month': { $gt: startMonth }
                            },
                            {
                                'time_slots.year': startYear,
                                'time_slots.month': startMonth,
                                'time_slots.day': { $gte: startDay }
                            }
                        ]
                    });
                }

                if (date_to) {
                    const endDate = new Date(date_to);
                    const endYear = endDate.getFullYear();
                    const endMonth = endDate.getMonth() + 1;
                    const endDay = endDate.getDate();

                    dateConditions.push({
                        $or: [
                            { 'time_slots.year': { $lt: endYear } },
                            {
                                'time_slots.year': endYear,
                                'time_slots.month': { $lt: endMonth }
                            },
                            {
                                'time_slots.year': endYear,
                                'time_slots.month': endMonth,
                                'time_slots.day': { $lte: endDay }
                            }
                        ]
                    });
                }

                // Nếu có điều kiện ngày, sử dụng $and để kết hợp các điều kiện => tạo ra điều kiện ngày
                if (dateConditions.length > 0) {
                    if (query.$and) {
                        query.$and.push({ $and: dateConditions });
                    } else {
                        query.$and = dateConditions;
                    }
                }
            }

            console.log('Slot search query:', JSON.stringify(query, null, 2));

            const totalItems = await this.slotSchema.countDocuments(query);

            const slots = await this.slotSchema
                .find(query)
                .sort({ [sort_by]: sort_order })
                .skip(skip)
                .limit(Number(pageSize))
                .populate({
                    path: 'staff_profile_ids',
                    select: 'employee_id job_title department_id',
                    populate: {
                        path: 'user_id',
                        select: 'first_name last_name email'
                    }
                })
                .populate({
                    path: 'appointment_id',
                    select: 'code status'
                });

            // Xử lý kết quả dựa trên vai trò của người dùng và tham số lọc
            const processedSlots = slots.map(slot => {
                const slotObj = slot.toObject();

                // Nếu lọc theo staff_profile_ids, chỉ hiển thị những nhân viên được yêu cầu trong phản hồi
                if (staff_profile_ids && Array.isArray(slotObj.staff_profile_ids)) {
                    // Lọc staff_profile_ids để chỉ bao gồm những nhân viên được yêu cầu
                    slotObj.staff_profile_ids = slotObj.staff_profile_ids.filter((profile: any) => {
                        return profile._id && requestedStaffIds.includes(profile._id.toString());
                    }) as any;
                }
                // Đối với danh sách xem (không lọc theo staff_profile_id cụ thể), ẩn staff_profile_ids cho vai trò STAFF
                else if (!staff_profile_ids && userRole === UserRoleEnum.STAFF) {
                    slotObj.staff_profile_ids = [];  // Thay thế bằng mảng trống
                }

                return slotObj;
            });

            const totalPages = Math.ceil(totalItems / pageSize);

            return {
                pageData: processedSlots,
                pageInfo: {
                    totalItems,
                    totalPages,
                    pageNum: Number(pageNum),
                    pageSize: Number(pageSize)
                }
            };
        } catch (error) {
            console.error('Error in getSlots:', error);
            throw error;
        }
    }

    /**
     * Get slot by ID with role-based access control
     * @param id Slot ID
     * @param userRole Role of the requesting user
     * @param userId ID of the requesting user
     * @param requestedStaffId Optional specific staff ID to filter in the response
     * @returns Slot with appropriate staff information based on user role
     */
    public async getSlotById(
        id: string,
        userRole?: string,
        userId?: string,
        requestedStaffId?: string
    ): Promise<ISlot> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid slot ID');
        }

        const slot = await this.slotRepository.findByIdWithPopulate(id);

        if (!slot) {
            throw new HttpException(HttpStatus.NotFound, 'Slot not found');
        }

        // Process the slot based on user role
        const slotObj = slot.toObject();

        // Nếu yêu cầu một nhân viên cụ thể và người dùng không phải là STAFF hoặc là nhân viên được yêu cầu
        if (requestedStaffId && (userRole !== UserRoleEnum.STAFF ||
            (userId && await this.isUserMatchingStaffId(userId, requestedStaffId)))) {
            // Lọc để chỉ hiển thị thông tin nhân viên được yêu cầu
            if (Array.isArray(slotObj.staff_profile_ids)) {
                slotObj.staff_profile_ids = slotObj.staff_profile_ids.filter((profile: any) => {
                    return profile._id && profile._id.toString() === requestedStaffId;
                });
            }
        }
        // Đối với vai trò STAFF, chỉ hiển thị thông tin của chính họ trong staff_profile_ids
        else if (userRole === UserRoleEnum.STAFF && userId && Array.isArray(slotObj.staff_profile_ids)) {
            const staffProfile = await this.staffProfileSchema.findOne({ user_id: userId });

            if (staffProfile) {
                // Kiểm tra xem nhân viên này có được giao slot hay không
                const isAssigned = slotObj.staff_profile_ids.some((profile: any) => {
                    return profile._id && profile._id.toString() === staffProfile._id.toString();
                });

                if (isAssigned) {
                    // Chỉ giữ lại thông tin nhân viên này trong danh sách
                    const staffProfileData = slotObj.staff_profile_ids.find((profile: any) =>
                        profile._id && profile._id.toString() === staffProfile._id.toString()
                    );

                    slotObj.staff_profile_ids = staffProfileData ? [staffProfileData] : [];
                } else {
                    // Nhân viên không được giao slot, ẩn tất cả thông tin nhân viên
                    slotObj.staff_profile_ids = [];
                }
            } else {
                // Staff profile not found, hide all staff info
                slotObj.staff_profile_ids = [];
            }
        }

        return slotObj as ISlot;
    }

    /**
     * Check if the given user ID matches the given staff profile ID
     * @param userId User ID to check
     * @param staffProfileId Staff profile ID to check against
     * @returns True if the user is associated with the staff profile
     */
    private async isUserMatchingStaffId(userId: string, staffProfileId: string): Promise<boolean> {
        if (!mongoose.Types.ObjectId.isValid(staffProfileId)) {
            return false;
        }

        const staffProfile = await this.staffProfileSchema.findById(staffProfileId);
        if (!staffProfile) {
            return false;
        }

        return staffProfile.user_id?.toString() === userId;
    }

    /**
     * Thay đổi trạng thái slot
     */
    public async changeSlotStatus(id: string, status: string): Promise<ISlot> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid slot ID');
        }

        const slot = await this.slotRepository.findById(id);
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
     * Get slots by user (staff) with role-based access control
     * @param userId User ID to get slots for
     * @param queryParams Query parameters
     * @param requestingUserRole Role of the requesting user
     * @param requestingUserId ID of the requesting user
     * @returns Paginated list of slots for the user
     */
    public async getSlotsByUser(
        userId: string,
        queryParams: any = {},
        requestingUserRole?: string,
        requestingUserId?: string
    ): Promise<SearchPaginationResponseModel<ISlot>> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid user ID');
        }

        // Find user
        const user = await this.userSchema.findById(userId);

        if (!user) {
            throw new HttpException(HttpStatus.NotFound, 'User not found');
        }

        if (user.status !== true) {
            throw new HttpException(HttpStatus.BadRequest, 'User is not active');
        }

        // Find staff profile
        const staffProfile = await this.staffProfileSchema.findOne({ user_id: userId });

        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found for this user');
        }

        // Check permissions - staff can only view their own slots
        if (requestingUserRole === UserRoleEnum.STAFF) {
            if (requestingUserId !== userId) {
                throw new HttpException(HttpStatus.Forbidden, 'As a staff member, you can only view your own slots');
            }
        }

        // Add staff_profile_id to query params
        const enrichedQueryParams = {
            ...queryParams,
            staff_profile_ids: [staffProfile._id.toString()]
        };

        // Use the getSlots method with role override to ensure we see all slots for this staff
        // We pass ADMIN as the role to bypass staff-specific filtering in getSlots
        return this.getSlots(enrichedQueryParams, UserRoleEnum.ADMIN);
    }

    /**
     * Lấy thống kê performance của phòng ban
     */
    public async getDepartmentPerformance(departmentId: string, queryParams: any): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid department ID');
        }

        // Lấy tất cả nhân viên thuộc phòng ban và trạng thái ACTIVE
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

    /**
     * Get available slots for booking with role-based filtering
     * @param params Search parameters
     * @param userRole Role of the requesting user
     * @param userId ID of the requesting user
     * @returns Paginated list of available slots
     */
    public async getAvailableSlots(
        params: {
            start_date: string;
            end_date?: string;
            type?: string;
            staff_profile_ids?: string | string[];
        },
        userRole?: string,
        userId?: string
    ): Promise<SearchPaginationResponseModel<ISlot>> {
        const { start_date, end_date, type, staff_profile_ids } = params;

        // Validate start_date
        if (!start_date) {
            throw new HttpException(HttpStatus.BadRequest, 'start_date is required');
        }

        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid start_date format');
        }

        // Set default end_date if not provided
        let endDate: Date;
        if (end_date) {
            endDate = new Date(end_date);
            if (isNaN(endDate.getTime())) {
                throw new HttpException(HttpStatus.BadRequest, 'Invalid end_date format');
            }
        } else {
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7); // Default to 7 days from start date
        }

        // Create query with all parameters
        const queryParams: Record<string, any> = {
            status: SlotStatusEnum.AVAILABLE,
            date_from: start_date,
            date_to: end_date,
            staff_profile_ids: staff_profile_ids
        };

        if (type) {
            // Validate type if provided
            const validTypes = Object.values(SampleMethodEnum);
            if (!validTypes.includes(type as SampleMethodEnum)) {
                throw new HttpException(HttpStatus.BadRequest, `Invalid type. Must be one of: ${validTypes.join(', ')}`);
            }
            queryParams.type = type;
        }

        // Use the getSlots method with role-based filtering
        return this.getSlots(queryParams, userRole, userId);
    }
}