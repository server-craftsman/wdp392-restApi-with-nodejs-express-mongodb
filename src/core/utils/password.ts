import bcryptjs from 'bcryptjs';

export const encodePasswordUserNormal = async (password: string) => {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password!, salt);
    return hashedPassword;
};
