import { FastifyTypedInstace } from "#/types/FastifyTypedInstace.js";
import { fastifyCors } from "@fastify/cors";

export function configureCors(server: FastifyTypedInstace) {
    server.register(fastifyCors, {
        origin: "*"
    });
}