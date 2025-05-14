import { IsNotEmpty } from 'class-validator';

export default class VerifiedTokenDto {
    constructor(verifiedToken: string) {
        this.verifiedToken = verifiedToken;
    }

    @IsNotEmpty()
    public verifiedToken: string;
}
