import bcryptjs from 'bcryptjs';
import logger from './logger';

/**
 * Interface định nghĩa cấu hình bảo mật password từ environment variables
 */
interface PasswordConfig {
    saltRounds: number;           // Số rounds cho bcrypt salt từ env
    minLength: number;            // Độ dài tối thiểu password từ env
    maxLength: number;            // Độ dài tối đa password từ env
    requireUppercase: boolean;    // Yêu cầu chữ hoa từ env
    requireLowercase: boolean;    // Yêu cầu chữ thường từ env  
    requireNumbers: boolean;      // Yêu cầu số từ env
    requireSpecialChars: boolean; // Yêu cầu ký tự đặc biệt từ env
}

/**
 * Lấy cấu hình password từ environment variables
 * @returns Object chứa config password security
 */
function getPasswordConfig(): PasswordConfig {
    return {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
        minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
        maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128'),
        requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
        requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
        requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
        requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true'
    };
}

/**
 * Validate password theo các quy tắc từ environment variables
 * @param password Password cần validate
 * @returns Object chứa kết quả validation và thông báo lỗi
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const config = getPasswordConfig();
    const errors: string[] = [];

    // Kiểm tra độ dài tối thiểu từ env
    if (password.length < config.minLength) {
        errors.push(`Password phải có ít nhất ${config.minLength} ký tự`);
    }

    // Kiểm tra độ dài tối đa từ env
    if (password.length > config.maxLength) {
        errors.push(`Password không được vượt quá ${config.maxLength} ký tự`);
    }

    // Kiểm tra yêu cầu chữ hoa nếu được bật trong env
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password phải chứa ít nhất một chữ cái viết hoa');
    }

    // Kiểm tra yêu cầu chữ thường nếu được bật trong env
    if (config.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password phải chứa ít nhất một chữ cái viết thường');
    }

    // Kiểm tra yêu cầu số nếu được bật trong env
    if (config.requireNumbers && !/\d/.test(password)) {
        errors.push('Password phải chứa ít nhất một chữ số');
    }

    // Kiểm tra yêu cầu ký tự đặc biệt nếu được bật trong env
    if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password phải chứa ít nhất một ký tự đặc biệt');
    }

    // Kiểm tra không chứa khoảng trắng
    if (/\s/.test(password)) {
        errors.push('Password không được chứa khoảng trắng');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Mã hóa password sử dụng bcryptjs với salt rounds từ environment variables
 * @param password Password cần mã hóa
 * @returns Promise trả về password đã được hash
 */
export const encodePasswordUserNormal = async (password: string): Promise<string> => {
    try {
        // Validate password trước khi hash
        const validation = validatePassword(password);
        if (!validation.isValid) {
            const errorMessage = `Password validation failed: ${validation.errors.join(', ')}`;
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        const config = getPasswordConfig();

        // Tạo salt với số rounds từ environment variables
        const salt = await bcryptjs.genSalt(config.saltRounds);

        // Hash password với salt đã tạo
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Log thông tin hash (không log password gốc vì bảo mật)
        logger.info(`Password hashed successfully with ${config.saltRounds} salt rounds`);

        return hashedPassword;
    } catch (error) {
        logger.error('Error encoding password:', error);
        throw new Error('Failed to encode password');
    }
};

/**
 * So sánh password với hash đã lưu
 * @param password Password plain text
 * @param hashedPassword Password đã được hash
 * @returns Promise trả về boolean cho biết password có đúng không
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        // Kiểm tra input validation
        if (!password || !hashedPassword) {
            logger.warn('Missing password or hash for comparison');
            return false;
        }

        // So sánh password với hash
        const isMatch = await bcryptjs.compare(password, hashedPassword);

        // Log kết quả (không log password thực tế)
        logger.debug(`Password comparison result: ${isMatch ? 'match' : 'no match'}`);

        return isMatch;
    } catch (error) {
        logger.error('Error comparing password:', error);
        return false; // Trả về false khi có lỗi để bảo mật
    }
};

/**
 * Tạo password ngẫu nhiên đáp ứng tất cả requirements từ env
 * @param length Độ dài password (mặc định từ env)
 * @returns Password ngẫu nhiên thỏa mãn tất cả điều kiện
 */
export const generateSecurePassword = (length?: number): string => {
    const config = getPasswordConfig();
    const passwordLength = length || Math.max(config.minLength, 12); // Ít nhất 12 ký tự

    // Định nghĩa các bộ ký tự
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    let guaranteedChars = '';

    // Thêm các bộ ký tự bắt buộc từ config
    if (config.requireLowercase) {
        charset += lowercase;
        guaranteedChars += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    }

    if (config.requireUppercase) {
        charset += uppercase;
        guaranteedChars += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    }

    if (config.requireNumbers) {
        charset += numbers;
        guaranteedChars += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    if (config.requireSpecialChars) {
        charset += specialChars;
        guaranteedChars += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    }

    // Nếu không có yêu cầu gì, dùng tất cả
    if (!charset) {
        charset = lowercase + uppercase + numbers + specialChars;
    }

    // Tạo password với độ dài còn lại
    let password = guaranteedChars;
    for (let i = guaranteedChars.length; i < passwordLength; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Trộn các ký tự để tránh pattern dễ đoán
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    logger.info(`Generated secure password with length ${password.length}`);
    return password;
};

/**
 * Kiểm tra password có bị compromise không (có thể mở rộng với API check)
 * @param password Password cần kiểm tra
 * @returns Promise trả về boolean, true nếu password an toàn
 */
export const checkPasswordSecurity = async (password: string): Promise<{ isSafe: boolean; warnings: string[] }> => {
    const warnings: string[] = [];

    // Kiểm tra các pattern phổ biến không an toàn
    const commonPatterns = [
        'password', '123456', 'qwerty', 'admin', 'letmein',
        'welcome', 'monkey', '1234567890', 'abc123'
    ];

    const lowerPassword = password.toLowerCase();
    for (const pattern of commonPatterns) {
        if (lowerPassword.includes(pattern)) {
            warnings.push(`Password chứa pattern không an toàn: "${pattern}"`);
        }
    }

    // Kiểm tra keyboard patterns
    const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', '1234', 'abcd'];
    for (const pattern of keyboardPatterns) {
        if (lowerPassword.includes(pattern)) {
            warnings.push(`Password chứa keyboard pattern: "${pattern}"`);
        }
    }

    // Kiểm tra repeated characters
    if (/(.)\1{2,}/.test(password)) {
        warnings.push('Password chứa ký tự lặp lại liên tiếp');
    }

    // Kiểm tra sequential characters
    for (let i = 0; i < password.length - 2; i++) {
        const char1 = password.charCodeAt(i);
        const char2 = password.charCodeAt(i + 1);
        const char3 = password.charCodeAt(i + 2);

        if (char2 === char1 + 1 && char3 === char2 + 1) {
            warnings.push('Password chứa ký tự tuần tự');
            break;
        }
    }

    const isSafe = warnings.length === 0;

    if (!isSafe) {
        logger.warn(`Password security check failed: ${warnings.join(', ')}`);
    }

    return { isSafe, warnings };
};

/**
 * Lấy thông tin cấu hình password hiện tại (cho debugging/monitoring)
 * @returns Object chứa config password không sensitive
 */
export const getPasswordConfigInfo = () => {
    const config = getPasswordConfig();
    return {
        saltRounds: config.saltRounds,
        minLength: config.minLength,
        maxLength: config.maxLength,
        requirements: {
            uppercase: config.requireUppercase,
            lowercase: config.requireLowercase,
            numbers: config.requireNumbers,
            specialChars: config.requireSpecialChars
        }
    };
};

/**
 * Export function chính để tương thích với code cũ
 * Được enhance với validation và config từ env
 */
export { encodePasswordUserNormal as hashPassword };
