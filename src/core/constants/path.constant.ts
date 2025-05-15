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

    // subscription
    SUBSCRIPTION: '/api/subscription',
    SEARCH_SUBSCRIPTION_BY_INSTRUCTOR: '/api/subscription/search-for-instructor',
    SEARCH_SUBSCRIPTION_BY_SUBSCRIBER: '/api/subscription/search-for-subscriber',

    // category
    CATEGORY: '/api/category',
    SEARCH_CATEGORY: '/api/category/search',

    // course
    COURSE: '/api/course',
    SEARCH_COURSE: '/api/course/search',
    CHANGE_STATUS_COURSE: '/api/course/change-status',
    GET_COURSE_DETAIL: '/api/course/detail',

    COURSE_LOG: '/api/course/log',
    SEARCH_COURSE_LOG: '/api/course/log/search',

    // session
    SESSION: '/api/session',
    SEARCH_SESSION: '/api/session/search',

    // lesson
    LESSON: '/api/lesson',
    SEARCH_LESSON: '/api/lesson/search',

    // review
    REVIEW: '/api/review',
    SEARCH_REVIEW: '/api/review/search',

    // cart
    CART: '/api/cart',
    SEARCH_CART: '/api/cart/search',
    UPDATE_STATUS_CART: '/api/cart/update-status',

    // purchase
    PURCHASE: '/api/purchase',
    SEARCH_PURCHASE: '/api/purchase/search',
    SEARCH_PURCHASE_BY_INSTRUCTOR: '/api/purchase/search-for-instructor',
    SEARCH_PURCHASE_BY_STUDENT: '/api/purchase/search-for-student',

    // payout
    PAYOUT: '/api/payout',
    SEARCH_PAYOUT: '/api/payout/search',
    UPDATE_STATUS_PAYOUT: '/api/payout/update-status',

    // blog
    BLOG: '/api/blog',
    SEARCH_BLOG: '/api/blog/search',

    // client
    CLIENT: '/api/client',
    COURSE_IN_CLIENT: '/api/client/course',
    SEARCH_COURSE_IN_CLIENT: '/api/client/course/search',
    SEARCH_CATEGORY_IN_CLIENT: '/api/client/category/search',
    BLOG_IN_CLIENT: '/api/client/blog',
    SEARCH_BLOG_IN_CLIENT: '/api/client/blog/search',
};
