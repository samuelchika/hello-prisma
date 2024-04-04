import bcrypt from "bcrypt";

export const verifyPassword = (plainPassword: string, hash: string) => {
    return bcrypt.compareSync(plainPassword, hash)
}

export const hashPassword = (password: string) => {
    return bcrypt.hashSync(password, 10);
}