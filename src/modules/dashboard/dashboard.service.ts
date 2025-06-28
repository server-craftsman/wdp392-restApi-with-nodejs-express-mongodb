import PaymentSchema from '../payment/payment.model';
import AppointmentSchema from '../appointment/appointment.model';
import UserSchema from '../user/user.model';
import SampleSchema from '../sample/sample.model';
import ResultSchema from '../result/result.model';
import { PaymentStatusEnum } from '../payment/payment.enum';
import mongoose from 'mongoose';
import { AppointmentStatusEnum } from '../appointment/appointment.enum';

export default class DashboardService {
    public async getSummary() {
        const [users, appointments, samples, results, payments, revenue] = await Promise.all([
            UserSchema.countDocuments({}),
            AppointmentSchema.countDocuments({}),
            SampleSchema.countDocuments({}),
            ResultSchema.countDocuments({}),
            PaymentSchema.countDocuments({}),
            this.getTotalRevenue()
        ]);

        return {
            users,
            appointments,
            samples,
            results,
            payments,
            revenue
        };
    }

    // Phương thức tính tổng doanh thu từ các giao dịch đã hoàn thành
    public async getTotalRevenue(): Promise<number> {
        const res = await PaymentSchema.aggregate([ // aggregation để truy vấn dữ liệu - nhóm tất cả và tính tổng
            { $match: { status: PaymentStatusEnum.COMPLETED } },
            { $group: { _id: null, total: { $sum: '$amount' } } } // Nhóm tất cả và tính tổng amount
        ]);
        return res[0]?.total || 0;
    }

    // Phương thức lấy doanh thu theo ngày trong khoảng thời gian
    public async getRevenue(from?: string, to?: string) {
        const match: any = { status: PaymentStatusEnum.COMPLETED };
        // Nếu có tham số thời gian, thêm điều kiện lọc theo ngày
        if (from || to) {
            match.created_at = {};
            // Nếu có ngày bắt đầu, lọc từ ngày đó trở đi
            if (from) match.created_at.$gte = new Date(from);
            // Nếu có ngày kết thúc, lọc đến ngày đó
            if (to) match.created_at.$lte = new Date(to);
        }

        // Thực hiện aggregation để nhóm doanh thu theo ngày
        const data = await PaymentSchema.aggregate([
            // Áp dụng điều kiện lọc
            { $match: match },
            {
                // Nhóm theo ngày (format YYYY-MM-DD)
                $group: {
                    _id: {
                        // Chuyển đổi ngày thành chuỗi định dạng YYYY-MM-DD
                        $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
                    },
                    // Tính tổng tiền trong ngày
                    total: { $sum: '$amount' },
                    // Đếm số giao dịch trong ngày
                    count: { $sum: 1 }
                }
            },
            // Sắp xếp theo ngày tăng dần
            { $sort: { _id: 1 } }
        ]);
        return data;
    }

    // Phương thức đếm số lượng giao dịch theo từng trạng thái
    public async getPaymentStatusCounts() {
        const aggregation = await PaymentSchema.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } } // nhóm theo trạng thái và đếm số lượng
        ]);
        const result: Record<string, number> = {}; // tạo object để lưu kết quả
        aggregation.forEach((item) => { // duyệt qua kết quả aggregation và gán vào object
            result[item._id] = item.count; // gán số lượng theo từng trạng thái
        });
        return result;
    }

    // Phương thức lấy thống kê cho nhân viên (staff) theo ID
    public async getStaffSummary(userId: string) {
        const objectId = new mongoose.Types.ObjectId(userId);
        // Lấy thống kê cuộc hẹn được phân công cho nhân viên này
        const aggregation = await AppointmentSchema.aggregate([
            // Lọc các cuộc hẹn có staff_id trùng với userId
            { $match: { staff_id: objectId } },
            // Nhóm theo trạng thái cuộc hẹn và đếm số lượng
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        // Khởi tạo object kết quả với tổng số cuộc hẹn được phân công
        const result: Record<string, number> = {
            total_assigned: 0
        } as any;
        // Duyệt qua kết quả và tính tổng
        aggregation.forEach((item) => {
            // Gán số lượng theo từng trạng thái
            result[item._id] = item.count;
            // Cộng dồn vào tổng số cuộc hẹn được phân công
            result.total_assigned += item.count;
        });
        return result;
    }

    // Phương thức lấy thống kê cho kỹ thuật viên xét nghiệm theo ID
    public async getLabTechSummary(userId: string) {
        const objectId = new mongoose.Types.ObjectId(userId);
        // Lấy thống kê cuộc hẹn được phân công cho kỹ thuật viên này
        const aggregation = await AppointmentSchema.aggregate([
            // Lọc các cuộc hẹn có laboratory_technician_id trùng với userId
            { $match: { laboratory_technician_id: objectId } },
            // Nhóm theo trạng thái cuộc hẹn và đếm số lượng
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        // Khởi tạo object kết quả với tổng số cuộc hẹn được phân công
        const result: Record<string, number> = {
            total_assigned: 0
        } as any;
        // Duyệt qua kết quả và tính tổng
        aggregation.forEach((item) => {
            // Gán số lượng theo từng trạng thái
            result[item._id] = item.count;
            // Cộng dồn vào tổng số cuộc hẹn được phân công
            result.total_assigned += item.count;
        });
        return result;
    }
} 