import ResultSchema from './result.model';
import { IResult, ICertificateRequest } from './result.interface';
import { ResultMatchEnum } from './result.enum';
import ResultController from './result.controller';
import ResultService from './result.service';
import ResultRepository from './result.repository';
import ResultRoute from './result.route';
import { CreateResultDto, UpdateResultDto, StartTestingDto } from './dtos';

export { ResultSchema, IResult, ICertificateRequest, ResultMatchEnum, ResultController, ResultService, ResultRepository, ResultRoute, CreateResultDto, UpdateResultDto, StartTestingDto };
