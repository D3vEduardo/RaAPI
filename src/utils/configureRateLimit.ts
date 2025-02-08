import {fastifyRateLimit, RateLimitOptions} from "@fastify/rate-limit";
import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";

export function configureRateLimit(server: FastifyTypedInstance) {
    const rateLimitOptions: RateLimitOptions = {
        max: 100,
        timeWindow: "1 minute",
        hook: "onRequest",
    }

    server.register(fastifyRateLimit, rateLimitOptions)
}