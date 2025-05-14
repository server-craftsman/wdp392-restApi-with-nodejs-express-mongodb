import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchUserDto from './searchUser.dto';

export default class SearchPaginationUserDto extends SearchPaginationRequestModel<SearchUserDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchUserDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchUserDto)
    public searchCondition!: SearchUserDto;
}
