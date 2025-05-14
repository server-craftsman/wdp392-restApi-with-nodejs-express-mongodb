
import { IsInt, Min } from 'class-validator';
import { PAGINATION } from '../constants';

export class PaginationRequestModel {
    constructor(pageNum: number = PAGINATION.pageNum, pageSize: number = PAGINATION.pageSize) {
        this.pageNum = pageNum;
        this.pageSize = pageSize;
    }

    @IsInt()
    @Min(PAGINATION.pageNum)
    public pageNum: number;

    @IsInt()
    @Min(PAGINATION.pageSize)
    public pageSize: number;
}

export class PaginationResponseModel {
    constructor(
        pageNum: number = PAGINATION.pageNum,
        pageSize: number = PAGINATION.pageSize,
        totalItems: number = PAGINATION.totalItems,
        totalPages: number = PAGINATION.totalPages,
    ) {
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
    }

    public pageNum: number;
    public pageSize: number;
    public totalItems: number;
    public totalPages: number;
}
