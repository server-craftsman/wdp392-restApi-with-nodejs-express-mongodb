import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IKit } from './kit.interface';
import { KitStatusEnum } from './kit.enum';
import KitRepository from './kit.repository';
import mongoose from 'mongoose';
import { CreateKitDto } from './dtos/createKit.dto';
import { UpdateKitDto } from './dtos/updateKit.dto';
import { SearchKitDto } from './dtos/searchKit.dto';
import { ReturnKitDto } from './dtos/returnKit.dto';
import { SearchPaginationResponseModel } from '../../core/models/searchPagination.model';
import { PaginationResponseModel } from '../../core/models/pagination.model';
import { format, isValid, parse } from "date-fns";

export default class KitService {
    private kitRepository = new KitRepository();

    // Hàm tự động sinh mã kit
    private async generateKitCode(): Promise<string> {
        const today = new Date();
        const dateStr = format(today, "yyyyMMdd"); // e.g., 20250528

        // Tìm số lượng kit đã tạo trong ngày để xác định số thứ tự
        const kitsToday = await this.kitRepository.countDocuments({
            code: { $regex: `^KIT-${dateStr}-` }
        });

        const sequence = (kitsToday + 1).toString().padStart(3, "0"); // e.g., 001, 002, ...
        if (parseInt(sequence) > 999) {
            throw new HttpException(HttpStatus.Conflict, "Maximum kits for today reached (999)");
        }

        return `KIT-${dateStr}-${sequence}`; // e.g., KIT-20250528-001
    }

    // Hàm validate mã kit nếu người dùng nhập thủ công
    private validateKitCode(code: string): void {
        // Kiểm tra định dạng tổng quát
        const codeRegex = /^KIT-\d{8}-\d{3}$/;
        if (!codeRegex.test(code)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid code format');
        }

        // Kiểm tra phần ngày
        const dateStr = code.split("-")[1]; // e.g., 20250528
        const parsedDate = parse(dateStr, "yyyyMMdd", new Date());
        if (!isValid(parsedDate)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid date');
        }

        // Kiểm tra số thứ tự
        const sequence = parseInt(code.split("-")[2], 10); // e.g., 001 -> 1
        if (sequence < 1 || sequence > 999) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid sequence');
        }
    }

    /**
     * Create a new kit with auto-generated code
     */
    public async createKit(kitData?: CreateKitDto): Promise<IKit> {
        try {
            // Generate or validate kit code
            let code: string;

            if (!kitData || !kitData.code) {
                code = await this.generateKitCode();
                console.log("Generated kit code:", code);
            } else {
                code = kitData.code;
                console.log("Using provided kit code:", code);
                this.validateKitCode(code);
            }

            // Check for duplicate kit code
            const existingKit = await this.kitRepository.findOne({ code });
            if (existingKit) {
                throw new HttpException(HttpStatus.Conflict, 'Kit code already exists');
            }

            // Create new kit
            const kit = await this.kitRepository.create({
                code,
                status: KitStatusEnum.AVAILABLE,
                created_at: new Date(),
                updated_at: new Date()
            });

            console.log("Kit created successfully:", kit);
            return kit;
        } catch (error) {
            console.error("Error in createKit:", error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error creating kit');
        }
    }

    /**
     * Find an available kit by ID
     */
    public async findAvailableKitById(kitId: string): Promise<IKit> {
        if (!mongoose.Types.ObjectId.isValid(kitId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
        }

        const kit = await this.kitRepository.findById(kitId);
        if (!kit) {
            throw new HttpException(HttpStatus.NotFound, 'Kit not found');
        }

        if (kit.status !== KitStatusEnum.AVAILABLE) {
            throw new HttpException(HttpStatus.BadRequest, 'Kit is not available');
        }

        return kit;
    }

    /**
     * Get kit by ID
     */
    public async getKitById(kitId: string): Promise<IKit> {
        if (!mongoose.Types.ObjectId.isValid(kitId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
        }

        const kit = await this.kitRepository.findByIdWithPopulate(kitId);
        if (!kit) {
            throw new HttpException(HttpStatus.NotFound, 'Kit not found');
        }

        return kit;
    }

    /**
     * Search kits with pagination
     */
    public async searchKits(searchParams: SearchKitDto): Promise<SearchPaginationResponseModel<IKit>> {
        try {
            const { pageNum = 1, pageSize = 10, ...filters } = searchParams;

            const query: any = {};

            if (filters.code) {
                query.code = { $regex: filters.code, $options: 'i' };
            }

            if (filters.status) {
                query.status = filters.status;
            }

            if (filters.appointment_id) {
                query.appointment_id = filters.appointment_id;
            }

            if (filters.assigned_to_user_id) {
                query.assigned_to_user_id = filters.assigned_to_user_id;
            }

            const skip = (pageNum - 1) * pageSize;
            const limit = pageSize;

            const [kits, totalCount] = await Promise.all([
                this.kitRepository.findWithPopulate(query, { created_at: -1 }, skip, limit),
                this.kitRepository.countDocuments(query)
            ]);

            const paginationInfo = new PaginationResponseModel(
                pageNum,
                pageSize,
                totalCount,
                Math.ceil(totalCount / pageSize)
            );

            return new SearchPaginationResponseModel<IKit>(kits, paginationInfo);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(HttpStatus.InternalServerError, 'Error searching kits');
        }
    }

    /**
     * Update a kit
     */
    public async updateKit(kitId: string, kitData: UpdateKitDto): Promise<IKit> {
        if (!mongoose.Types.ObjectId.isValid(kitId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
        }

        const kit = await this.kitRepository.findById(kitId);
        if (!kit) {
            throw new HttpException(HttpStatus.NotFound, 'Kit not found');
        }

        if (kit.status !== KitStatusEnum.AVAILABLE) {
            throw new HttpException(HttpStatus.BadRequest, 'Kit is not available');
        }

        if (kitData.notes) {
            kit.notes = kitData.notes;
        }

        const updatedKit = await this.kitRepository.findByIdAndUpdate(
            kitId,
            {
                ...kitData,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedKit) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to update kit');
        }

        return updatedKit;
    }

    /**
     * Delete a kit
     */
    public async deleteKit(kitId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(kitId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
        }

        const kit = await this.kitRepository.findById(kitId);
        if (!kit) {
            throw new HttpException(HttpStatus.NotFound, 'Kit not found');
        }

        if (kit.status === KitStatusEnum.ASSIGNED || kit.status === KitStatusEnum.USED) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'Cannot delete kit that is currently assigned or in use'
            );
        }

        await this.kitRepository.findByIdAndUpdate(kitId, { status: KitStatusEnum.DAMAGED });
    }

    /**
     * Change kit status
     */
    public async changeKitStatus(kitId: string, status: KitStatusEnum): Promise<IKit> {
        if (!mongoose.Types.ObjectId.isValid(kitId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
        }

        if (!Object.values(KitStatusEnum).includes(status)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid status');
        }

        const kit = await this.kitRepository.findById(kitId);
        if (!kit) {
            throw new HttpException(HttpStatus.NotFound, 'Kit not found');
        }

        const updatedKit = await this.kitRepository.findByIdAndUpdate(
            kitId,
            {
                status,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedKit) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to update kit status');
        }

        return updatedKit;
    }

    /**
     * Get all available kits
     */
    public async getAvailableKits(): Promise<IKit[]> {
        return this.kitRepository.find({ status: KitStatusEnum.AVAILABLE });
    }

    /**
     * Assign a kit to an appointment and user
     */
    public async assignKit(kitId: string, appointmentId: string, userId: string): Promise<IKit> {
        const kit = await this.findAvailableKitById(kitId);

        const updatedKit = await this.kitRepository.findByIdAndUpdate(
            kitId,
            {
                status: KitStatusEnum.ASSIGNED,
                appointment_id: appointmentId as any,
                assigned_to_user_id: userId as any,
                assigned_date: new Date(),
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedKit) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to assign kit');
        }

        return updatedKit;
    }

    /**
     * Return a kit
     */
    public async returnKit(kitId: string, notes?: string): Promise<IKit> {
        if (!mongoose.Types.ObjectId.isValid(kitId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
        }

        const kit = await this.kitRepository.findById(kitId);
        if (!kit) {
            throw new HttpException(HttpStatus.NotFound, 'Kit not found');
        }

        if (kit.status !== KitStatusEnum.ASSIGNED && kit.status !== KitStatusEnum.USED) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'Only assigned or used kits can be returned'
            );
        }

        const updatedKit = await this.kitRepository.findByIdAndUpdate(
            kitId,
            {
                status: KitStatusEnum.RETURNED,
                return_date: new Date(),
                notes,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedKit) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to return kit');
        }

        return updatedKit;
    }

    /**
     * Process query parameters
     */
    private processQueryParams(queryParams: any): any {
        const { pageNum = 1, pageSize = 10, ...rest } = queryParams;
        return {
            pageNum: parseInt(pageNum),
            pageSize: parseInt(pageSize),
            ...rest
        };
    }
} 