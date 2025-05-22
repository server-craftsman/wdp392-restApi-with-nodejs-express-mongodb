import { UserRoleEnum, UserGenderEnum } from './user.enum';

export const UserRoles = ['', UserRoleEnum.ALL, UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.STAFF, UserRoleEnum.CUSTOMER, UserRoleEnum.LABORATORY_TECHNICIAN];
export const UserGenders = ['', UserGenderEnum.MALE, UserGenderEnum.FEMALE, UserGenderEnum.OTHER];