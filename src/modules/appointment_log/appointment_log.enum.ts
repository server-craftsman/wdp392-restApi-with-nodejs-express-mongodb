export enum AppointmentLogTypeEnum {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SAMPLE_ASSIGNED = 'sample_assigned',
    SAMPLE_COLLECTED = 'sample_collected',
    SAMPLE_RECEIVED = 'sample_received',
    TESTING = 'testing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    SAMPLE_CREATED = 'sample_created',
    // Administrative appointment statuses
    AWAITING_AUTHORIZATION = 'awaiting_authorization',
    AUTHORIZED = 'authorized',
    READY_FOR_COLLECTION = 'ready_for_collection',
}

export enum AppointmentLogActionEnum {
    CREATE = 'create',
    UPDATE_STATUS = 'update_status',
    ASSIGN_STAFF = 'assign_staff',
    ASSIGN_LAB_TECH = 'assign_lab_tech',
    CHECKIN = 'checkin',
    ADD_NOTE = 'add_note',
    CONFIRM = 'confirm',
    CANCEL = 'cancel',
    // Administrative actions
    AUTHORIZE = 'authorize',
    PROGRESS_UPDATE = 'progress_update',
    AGENCY_NOTIFICATION = 'agency_notification',
}
