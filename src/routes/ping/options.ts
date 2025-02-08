import {FastifySchema} from "fastify";
import {z} from "zod";
import {RouteOptionsType} from "@/types/routeOptionsType.js";

export const pingOptions: RouteOptionsType = {
    schema: {
        response: {
            200: z.object({
                message: z.string()
            })
        }
    }
}