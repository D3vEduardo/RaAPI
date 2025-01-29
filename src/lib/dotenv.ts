import { config } from "dotenv";
config();

export const {
    SERVER_PORT,
    SECRET_KEY,
    IMGUR_CLIENT_SECRET,
    IMGUR_CLIENT_ID
} = process.env;