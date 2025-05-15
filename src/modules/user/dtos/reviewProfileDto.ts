import { IsIn, IsNotEmpty } from 'class-validator';
import { UserReviewStatusEnum } from '../user.enum';
import { UserReviewStatus } from '../user.interface';

export default class ReviewProfileDto {
    constructor(user_id: string, status: UserReviewStatus, comment: string) {
        this.user_id = user_id;
        this.status = status;
        this.comment = comment;
    }

    @IsNotEmpty()
    public user_id: string;

    @IsIn([UserReviewStatusEnum.APPROVE, UserReviewStatusEnum.REJECT])
    public status: UserReviewStatus;

    public comment: string;
}
