export const API_PATH = {
    // migrate
    MIGRATE: '/api/migrate',
    MIGRATE_SETTING: '/api/migrate/setting',
    MIGRATE_USERS: '/api/migrate/users',

    // setting
    SETTING: '/api/setting',
    SETTING_DEFAULT: '/api/setting/default',

    // auth
    AUTH: '/api/auth',
    AUTH_GOOGLE: '/api/auth/google',
    AUTH_VERIFY_TOKEN: '/api/auth/verify-token',
    AUTH_RESEND_TOKEN: '/api/auth/resend-token',
    AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
    AUTH_LOGOUT: '/api/auth/logout',

    // user
    USERS: '/api/users',
    GENERATE_USERS: '/api/users/generate',
    SEARCH_USERS: '/api/users/search',
    CREATE_USERS: '/api/users/create',
    USERS_GOOGLE: '/api/users/google',
    CHANGE_PASSWORD_USERS: '/api/users/change-password',
    CHANGE_STATUS_USERS: '/api/users/change-status',
    CHANGE_ROLE_USER: '/api/users/change-role',
    REVIEW_PROFILE_ACCOUNT: '/api/users/review-profile-account',

    // DNA Testing Service API paths
    // Service
    SERVICE: '/api/service',
    SEARCH_SERVICE: '/api/service/search',
    CREATE_SERVICE: '/api/service/create',
    GET_SERVICE_BY_ID: '/api/service/:id',
    UPDATE_SERVICE: '/api/service/:id',
    DELETE_SERVICE: '/api/service/:id',


    // Appointment
    APPOINTMENT: '/api/appointment',
    SEARCH_APPOINTMENT: '/api/appointment/search',
    APPOINTMENT_FEEDBACK: '/api/appointment/feedback',
    CREATE_APPOINTMENT: '/api/appointment/create',
    GET_APPOINTMENT_BY_ID: '/api/appointment/:id',
    ASSIGN_STAFF_TO_APPOINTMENT: '/api/appointment/:id/assign-staff',
    CONFIRM_APPOINTMENT: '/api/appointment/:id/confirm',

    // Appointment Log
    APPOINTMENT_LOG: '/api/appointment-logs',
    GET_LOGS_BY_APPOINTMENT: '/api/appointment-logs/appointment/:appointmentId',

    // Kit
    KIT: '/api/kit',
    SEARCH_KIT: '/api/kit/search',
    CREATE_KIT: '/api/kit/create',
    CREATE_MULTIPLE_KITS: '/api/kit/create-multiple',
    GET_KIT_BY_ID: '/api/kit/:id',
    UPDATE_KIT: '/api/kit/:id',
    DELETE_KIT: '/api/kit/:id',
    CHANGE_KIT_STATUS: '/api/kit/:id/status',
    GET_AVAILABLE_KITS: '/api/kit/available',
    ASSIGN_KIT: '/api/kit/assign',
    RETURN_KIT: '/api/kit/:id/return',

    // Sample
    SAMPLE: '/api/sample',
    SEARCH_SAMPLE: '/api/sample/search',
    COLLECT_SAMPLE: '/api/sample/collect',
    RECEIVE_SAMPLE: '/api/sample/receive',

    // Registration Form
    REGISTRATION_FORM: '/api/registration-form',
    SEARCH_REGISTRATION_FORM: '/api/registration-form/search',

    // Result
    RESULT: '/api/result',
    SEARCH_RESULT: '/api/result/search',

    // Payment
    PAYMENT: '/api/payment',
    SEARCH_PAYMENT: '/api/payment/search',

    // Transaction
    TRANSACTION: '/api/transaction',
    SEARCH_TRANSACTION: '/api/transaction/search',


    // Department
    DEPARTMENT: '/api/department',
    SEARCH_DEPARTMENT: '/api/department/search',
    DEPARTMENT_STATISTICS: '/api/department/:departmentId/statistics',
    DEPARTMENT_CAPACITY: '/api/department/:departmentId/capacity',
    DEPARTMENT_PERFORMANCE: '/api/department/:departmentId/performance',


    // Staff Profile
    STAFF_PROFILE: '/api/staff-profile',
    SEARCH_STAFF_PROFILE: '/api/staff-profile/search',
    CREATE_STAFF_PROFILE: '/api/staff-profile/create',
    UPDATE_STAFF_PROFILE: '/api/staff-profile/:id',
    DELETE_STAFF_PROFILE: '/api/staff-profile/:id',

    // Work Schedule
    WORK_SCHEDULE: '/api/work-schedule',
    SEARCH_WORK_SCHEDULE: '/api/work-schedule/search',

    // Slot
    SLOT: '/api/slot',
    SEARCH_SLOT: '/api/slot/search',
    CREATE_SLOT: '/api/slot/create',
    UPDATE_SLOT: '/api/slot/:id',
    DELETE_SLOT: '/api/slot/:id',
    CHANGE_SLOT_STATUS: '/api/slot/:id/status',
    GET_SLOT_BY_SERVICE: '/api/slot/service/:serviceId',
    GET_SLOT_BY_STAFF: '/api/slot/staff/:id',
    GET_SLOT_BY_DEPARTMENT: '/api/slot/department/:departmentId',
    GET_SLOT_BY_ID: '/api/slot/:id',
    AVAILABLE_SLOT: '/api/slot/available',


    // Attendance
    ATTENDANCE: '/api/attendance',
    SEARCH_ATTENDANCE: '/api/attendance/search',

    // Refund
    REFUND: '/api/refund',
    SEARCH_REFUND: '/api/refund/search',
    APPROVE_REFUND: '/api/refund/approve',
    REJECT_REFUND: '/api/refund/reject',
    COMPLETE_REFUND: '/api/refund/complete',

    // Blog
    BLOG: '/api/blog',
    BLOG_SEARCH: '/api/blog/search',
    BLOG_CREATE: '/api/blog/create',
    BLOG_UPDATE: '/api/blog/:id',
    BLOG_LOGS: '/api/blog/:id/logs',
    BLOG_DELETE: '/api/blog/:id',

    // Blog Category
    BLOG_CATEGORY: '/api/blog-category',
    BLOG_CATEGORY_SEARCH: '/api/blog-category/search',
    BLOG_CATEGORY_CREATE: '/api/blog-category/create',
    BLOG_CATEGORY_UPDATE: '/api/blog-category/:id',
    BLOG_CATEGORY_DELETE: '/api/blog-category/:id',
};
