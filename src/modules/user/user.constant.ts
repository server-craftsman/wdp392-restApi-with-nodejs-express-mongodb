import { UserRoleEnum, UserGenderEnum, UserStatusEnum } from './user.enum';

export const UserRoles = ['', UserRoleEnum.ALL, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER];
export const UserGenders = ['', UserGenderEnum.MALE, UserGenderEnum.FEMALE, UserGenderEnum.OTHER];
export const UserStatuses = ['', UserStatusEnum.ACTIVE, UserStatusEnum.INACTIVE, UserStatusEnum.SUSPENDED];
