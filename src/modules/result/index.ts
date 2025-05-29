import ResultSchema from './result.model';
import { IResult, ResultMatch, IResultData } from './result.interface';
import { ResultMatchEnum } from './result.enum';
import ResultController from './result.controller';
import ResultService from './result.service';
import ResultRepository from './result.repository';
import ResultRoute from './result.route';
import { CreateResultDto, UpdateResultDto, StartTestingDto } from './dtos';

export {
    ResultSchema,
    IResult,
    ResultMatch,
    IResultData,
    ResultMatchEnum,
    ResultController,
    ResultService,
    ResultRepository,
    ResultRoute,
    CreateResultDto,
    UpdateResultDto,
    StartTestingDto
}; 