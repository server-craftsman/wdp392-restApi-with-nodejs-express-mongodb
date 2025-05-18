import { AuditActionEnum, EntityTypeEnum } from './audit-log.enum';

export const AuditActions = [
    '',
    AuditActionEnum.CREATE,
    AuditActionEnum.UPDATE,
    AuditActionEnum.DELETE,
    AuditActionEnum.VIEW,
    AuditActionEnum.LOGIN,
    AuditActionEnum.LOGOUT
];

export const EntityTypes = [
    '',
    EntityTypeEnum.USER,
    EntityTypeEnum.SERVICE,
    EntityTypeEnum.APPOINTMENT,
    EntityTypeEnum.KIT,
    EntityTypeEnum.SAMPLE,
    EntityTypeEnum.RESULT,
    EntityTypeEnum.PAYMENT,
    EntityTypeEnum.TRANSACTION,
    EntityTypeEnum.BLOG
]; 