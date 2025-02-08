import {
    FastifyBaseLogger,
    FastifySchema,
    RawServerDefault,
    RouteGenericInterface,
    RouteShorthandOptions
} from "fastify";
import {IncomingMessage, ServerResponse} from "node:http";
import {ZodTypeProvider} from "fastify-type-provider-zod";

export type RouteOptionsType = RouteShorthandOptions<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, RouteGenericInterface, unknown, FastifySchema, ZodTypeProvider, FastifyBaseLogger>