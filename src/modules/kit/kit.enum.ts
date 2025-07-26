export enum KitStatusEnum {
    AVAILABLE = 'available',
    ASSIGNED = 'assigned',
    USED = 'used',
    RETURNED = 'returned',
    DAMAGED = 'damaged', // đã hư hỏng
}

export enum KitTypeEnum {
    REGULAR = 'regular', // Kit thường cho customer
    ADMINISTRATIVE = 'administrative', // Kit cho pháp lý/cơ quan thẩm quyền
}
