import { SearchPaginationResponseModel } from '../models';
import { PaginationResponseModel } from '../models/pagination.model';

export const formatPaginationResult = <T>(
    result: SearchPaginationResponseModel<T>,
    items: any[],
    paginationInfo: PaginationResponseModel,
) => {
    result.pageInfo.pageNum = paginationInfo.pageNum;
    result.pageInfo.pageSize = paginationInfo.pageSize;
    if (paginationInfo.totalItems > 0) {
        result.pageData = items;
        result.pageInfo.totalItems = paginationInfo.totalItems;
        result.pageInfo.totalPages = Math.ceil(paginationInfo.totalItems / paginationInfo.pageSize);
    }

    return result;
};
