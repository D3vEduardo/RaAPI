import {compare, hash} from "bcrypt";

export async function hashPassword(pass: string) {
    return await hash(pass, 10);
}

export async function verifyPassword(pass: string, hash: string) {
    return await compare(pass, hash);
}