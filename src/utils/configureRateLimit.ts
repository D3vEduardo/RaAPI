import { FastifyTypedInstace } from "#types/FastifyTypedInstace.js";
import { fastifyRateLimit } from "@fastify/rate-limit";

export function configureRateLimit(server: FastifyTypedInstace) {
    server.register(fastifyRateLimit, {
        max: 50,
        timeWindow: "1 minute",
        cache: 10000,
        keyGenerator: (req) => req.ip,
        ban: 6
    })
}