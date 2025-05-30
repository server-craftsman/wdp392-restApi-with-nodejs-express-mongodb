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
        const totalItems = await this.slotRepository.countDocuments(query);

        // Lấy dữ liệu với phân trang
        const slots = await this.slotRepository.findWithPopulate(query, { start_time: 1 }, skip, pageSize);

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
     * Lấy danh sách slot với các bộ lọc động (params mới)
     */
    public async getSlots(queryParams: any = {}): Promise<SearchPaginationResponseModel<ISlot>> {
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

            // tính toán số lượng skip
            const skip = (pageNum - 1) * pageSize;

            // tạo query
            const query: any = {};

            if (staff_profile_ids) {
                query.staff_profile_ids = Array.isArray(staff_profile_ids)
                    ? { $in: staff_profile_ids } // $in is used in array to filter the some of the values
                    : { $in: [staff_profile_ids] }; // $in is used in array to filter the some of the values        
            }

            // lọc theo department_id
            if (department_id) {
                const staffProfiles = await this.staffProfileSchema.find({
                    department_id,
                    status: StaffStatusEnum.ACTIVE
                });
                const staffProfileIds = staffProfiles.map(profile => profile._id);
                query.staff_profile_ids = { $in: staffProfileIds };
            }

            // lọc theo appointment_id
            if (appointment_id) {
                query.appointment_id = appointment_id;
            }

            if (status) {
                query.status = status;
            }

            // lọc theo khoảng thời gian
            if (date_from || date_to) {
                query.start_time = {};

                // lọc theo ngày bắt đầu
                if (date_from) {
                    query.start_time.$gte = new Date(date_from); // start_time >= date_from
                }

                // lọc theo ngày kết thúc
                if (date_to) {
                    const endDate = new Date(date_to);
                    endDate.setHours(23, 59, 59, 999);
                    query.start_time.$lte = endDate; // start_time <= end_time
                }
            }

            const totalItems = await this.slotSchema.countDocuments(query);

            // lấy danh sách slot
            const slots = await this.slotSchema
                .find(query)
                .sort({ [sort_by]: sort_order }) // sắp xếp theo trường sort_by và sort_order
                .skip(skip)
                .limit(Number(pageSize)) // giới hạn số lượng slot trả về
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
                })

            const totalPages = Math.ceil(totalItems / pageSize);

            return {
                pageData: slots,
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
     * Lấy slot theo ID
     */
    public async getSlotById(id: string): Promise<ISlot> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid slot ID');
        }

        const slot = await this.slotRepository.findByIdWithPopulate(id);

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
     * Lấy slots theo nhân viên (user)
     */
    public async getSlotsByUser(userId: string, queryParams: any = {}): Promise<SearchPaginationResponseModel<ISlot>> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid user ID');
        }

        // tìm user theo id
        const user = await this.userSchema.findById(userId);

        // nếu không tìm thấy user thì throw lỗi
        if (!user) {
            throw new HttpException(HttpStatus.NotFound, 'User not found');
        }

        // nếu user không active thì throw lỗi
        if (user.status !== true) {
            throw new HttpException(HttpStatus.BadRequest, 'User is not active');
        }

        // tìm staff profile theo user_id
        const staffProfile = await this.staffProfileSchema.findOne({ user_id: userId });

        if (!staffProfile) {
            throw new HttpException(HttpStatus.NotFound, 'Staff profile not found for this user');
        }

        // Process query parameters
        const {
            pageNum,
            pageSize,
            date_from,
            date_to,
            status
        } = this.processQueryParams(queryParams);

        const skip = (pageNum - 1) * pageSize;

        // Build query
        const query: any = {
            staff_profile_ids: { $in: [staffProfile._id] }
        };

        // Filter by status
        if (status) {
            query.status = status;
        }

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

        const totalItems = await this.slotSchema.countDocuments(query);

        // Lấy slot với phân trang và populate thông tin nhân viên
        const slots = await this.slotSchema
            .find(query)
            .sort({ start_time: 1 })
            .skip(skip)
            .limit(pageSize)
            .populate({
                path: 'staff_profile_ids',
                select: 'employee_id job_title department_id',
                populate: {
                    path: 'user_id',
                    select: 'first_name last_name email'
                }
            })

        const totalPages = Math.ceil(totalItems / pageSize);

        return new SearchPaginationResponseModel<ISlot>(slots, {
            pageNum,
            pageSize,
            totalItems,
            totalPages
        });
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
     * Lấy danh sách slots có sẵn để đặt lịch
     * 
     *
     */
    public async getAvailableSlots(params: {
        start_date: string;
        end_date?: string;
        type?: string;
    }): Promise<SearchPaginationResponseModel<ISlot>> {
        const { start_date, end_date, type } = params;

        // Validate start_date
        if (!start_date) {
            throw new HttpException(HttpStatus.BadRequest, 'start_date is required');
        }

        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) { // Kiểm tra xem startDate có phải là ngày hợp lệ không
            throw new HttpException(HttpStatus.BadRequest, 'Invalid start_date format');
        }

        // Nếu không có end_date, set default end_date là 7 ngày từ start_date
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

        // Build query
        const query: any = {
            status: SlotStatusEnum.AVAILABLE
        };

        // Filter slots by date range using time_slots
        query.time_slots = {
            $elemMatch: {
                year: { $gte: startDate.getFullYear(), $lte: endDate.getFullYear() },
                month: { $gte: startDate.getMonth() + 1, $lte: endDate.getMonth() + 1 },
                day: { $gte: startDate.getDate(), $lte: endDate.getDate() }
            }
        };

        // Nếu type được cung cấp, lọc theo kiểu dịch vụ
        if (type) {
            // Kiểm tra xem type có phải là một trong các giá trị hợp lệ của SampleMethodEnum không
            const validTypes = Object.values(SampleMethodEnum);
            if (!validTypes.includes(type as SampleMethodEnum)) {
                throw new HttpException(HttpStatus.BadRequest, `Invalid type. Must be one of: ${validTypes.join(', ')}`);
            }
        }

        // Count total slots matching the query
        const totalItems = await this.slotRepository.countDocuments(query);

        // Get slots with pagination (default page 1, limit 10)
        const pageNum = 1;
        const pageSize = 10;
        const skip = (pageNum - 1) * pageSize;

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / pageSize);

        // Get slots with populated data
        const slots = await this.slotRepository.findWithPopulate(query, { "time_slots.year": 1, "time_slots.month": 1, "time_slots.day": 1 }, skip, pageSize);

        // Return formatted response
        return new SearchPaginationResponseModel<ISlot>(slots, {
            pageNum,
            pageSize,
            totalItems,
            totalPages
        });
    }
}