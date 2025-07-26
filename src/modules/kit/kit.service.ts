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
import { format, isValid, parse } from 'date-fns';
import { KitTypeEnum } from './kit.enum';

export default class KitService {
    private kitRepository = new KitRepository();

    // Hàm tự động sinh mã kit
    private async generateKitCode(): Promise<string> {
        const today = new Date();
        const dateStr = format(today, 'yyyyMMdd'); // e.g., 20250528

        // Tìm số lượng kit đã tạo trong ngày để xác định số thứ tự
        const kitsToday = await this.kitRepository.countDocuments({
            code: { $regex: `^KIT-${dateStr}-` },
        });

        const sequence = (kitsToday + 1).toString().padStart(3, '0'); // e.g., 001, 002, ...
        if (parseInt(sequence) > 999) {
            throw new HttpException(HttpStatus.Conflict, 'Maximum kits for today reached (999)');
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
        const dateStr = code.split('-')[1]; // e.g., 20250528
        const parsedDate = parse(dateStr, 'yyyyMMdd', new Date());
        if (!isValid(parsedDate)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid date');
        }

        // Kiểm tra số thứ tự
        const sequence = parseInt(code.split('-')[2], 10); // e.g., 001 -> 1
        if (sequence < 1 || sequence > 999) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid sequence');
        }
    }

    /**
     * Create a new kit with auto-generated code
     */
    public async createKit(kitData?: CreateKitDto): Promise<IKit> {
        let code: string;

        try {
            // Handle code generation or validation
            if (!kitData || !kitData.code) {
                code = await this.generateKitCode();
            } else {
                code = kitData.code;
                this.validateKitCode(code);
            }

            // Check if kit already exists
            const existingKit = await this.kitRepository.findOne({ code });
            if (existingKit) {
                throw new HttpException(HttpStatus.Conflict, 'Kit code already exists');
            }

            // Create kit object with proper defaults
            const kitObject = {
                code,
                type: kitData?.type || KitTypeEnum.REGULAR,
                status: kitData?.status || KitStatusEnum.AVAILABLE,
                notes: kitData?.notes,
                administrative_case_id: kitData?.administrative_case_id,
                agency_authority: kitData?.agency_authority,
                created_at: new Date(),
                updated_at: new Date(),
            };

            // Create kit in database
            const kit = await this.kitRepository.create(kitObject);
            return kit;
        } catch (error) {
            // Handle errors
            if (error instanceof HttpException) {
                throw error;
            }

            console.error('Error creating kit:', error);
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
     * Search kits with filters and pagination
     */
    public async searchKits(searchParams: SearchKitDto): Promise<SearchPaginationResponseModel<IKit>> {
        try {
            const {
                code,
                type,
                status,
                assigned_to_user_id,
                administrative_case_id,
                agency_authority,
                pageNum = 1,
                pageSize = 10,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = searchParams;

            // Build query
            const query: any = {};

            if (code) {
                query.code = { $regex: code, $options: 'i' };
            }

            if (type) {
                query.type = type;
            }

            if (status) {
                query.status = status;
            }

            if (assigned_to_user_id) {
                query.assigned_to_user_id = assigned_to_user_id;
            }

            if (administrative_case_id) {
                query.administrative_case_id = administrative_case_id;
            }

            if (agency_authority) {
                query.agency_authority = { $regex: agency_authority, $options: 'i' };
            }

            // Pagination
            const skip = (pageNum - 1) * pageSize;
            const sort: any = { [sort_by]: sort_order === 'desc' ? -1 : 1 };

            // Execute query using repository
            const [kits, totalCount] = await Promise.all([
                this.kitRepository.findWithPopulate(query, sort, skip, pageSize),
                this.kitRepository.countDocuments(query)
            ]);

            const totalPages = Math.ceil(totalCount / pageSize);

            return new SearchPaginationResponseModel<IKit>(
                kits,
                new PaginationResponseModel(
                    pageNum,
                    pageSize,
                    totalCount,
                    totalPages
                )
            );
        } catch (error) {
            console.error('Error searching kits:', error);
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

        // Prepare update data with proper date handling
        const updateData: any = {
            updated_at: new Date(),
        };

        // Handle optional fields
        if (kitData.code) updateData.code = kitData.code;
        if (kitData.type) updateData.type = kitData.type;
        if (kitData.status) updateData.status = kitData.status;
        if (kitData.assigned_to_user_id) updateData.assigned_to_user_id = kitData.assigned_to_user_id;
        if (kitData.notes) updateData.notes = kitData.notes;
        if (kitData.administrative_case_id) updateData.administrative_case_id = kitData.administrative_case_id;
        if (kitData.agency_authority) updateData.agency_authority = kitData.agency_authority;

        // Handle date fields
        if (kitData.assigned_date) {
            updateData.assigned_date = new Date(kitData.assigned_date);
        }
        if (kitData.return_date) {
            updateData.return_date = new Date(kitData.return_date);
        }

        const updatedKit = await this.kitRepository.findByIdAndUpdate(
            kitId,
            updateData,
            { new: true },
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
            throw new HttpException(HttpStatus.BadRequest, 'Cannot delete kit that is currently assigned or in use');
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
                updated_at: new Date(),
            },
            { new: true },
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
     * Assign a kit to a technician
     */
    public async assignKit(kitId: string, assignData: any): Promise<IKit> {
        if (!mongoose.Types.ObjectId.isValid(kitId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
        }

        const kit = await this.kitRepository.findById(kitId);
        if (!kit) {
            throw new HttpException(HttpStatus.NotFound, 'Kit not found');
        }

        if (kit.status !== KitStatusEnum.AVAILABLE) {
            throw new HttpException(HttpStatus.BadRequest, 'Kit is not available for assignment');
        }

        // Update kit with assignment details
        const updateData: any = {
            status: KitStatusEnum.ASSIGNED,
            assigned_to_user_id: assignData.technician_id,
            assigned_date: new Date(),
            updated_at: new Date(),
        };

        // Add optional fields
        if (assignData.notes) {
            updateData.notes = assignData.notes;
        }

        const updatedKit = await this.kitRepository.findByIdAndUpdate(
            kitId,
            updateData,
            { new: true },
        );

        if (!updatedKit) {
            throw new HttpException(HttpStatus.InternalServerError, 'Failed to assign kit');
        }

        return updatedKit;
    }

    /**
     * Return a kit
     */
    public async returnKit(kitId: string, returnData?: ReturnKitDto): Promise<IKit> {
        if (!mongoose.Types.ObjectId.isValid(kitId)) {
            throw new HttpException(HttpStatus.BadRequest, 'Invalid kit ID');
        }

        const kit = await this.kitRepository.findById(kitId);
        if (!kit) {
            throw new HttpException(HttpStatus.NotFound, 'Kit not found');
        }

        if (kit.status !== KitStatusEnum.ASSIGNED && kit.status !== KitStatusEnum.USED) {
            throw new HttpException(HttpStatus.BadRequest, 'Kit is not assigned or in use');
        }

        // Determine the new status
        const newStatus = returnData?.status || KitStatusEnum.AVAILABLE;

        // Update kit with return details
        const updateData: any = {
            status: newStatus,
            return_date: new Date(),
            updated_at: new Date(),
        };

        // Clear assignment data if returning to available
        if (newStatus === KitStatusEnum.AVAILABLE) {
            updateData.assigned_to_user_id = null;
            updateData.assigned_date = null;
        }

        // Add notes if provided
        if (returnData?.notes) {
            updateData.notes = returnData.notes;
        }

        const updatedKit = await this.kitRepository.findByIdAndUpdate(
            kitId,
            updateData,
            { new: true },
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
            ...rest,
        };
    }
}
