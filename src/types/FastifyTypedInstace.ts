import { FastifyBaseLogger, FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from "fastify/types/utils.js";

export type FastifyTypedInstace = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    FastifyBaseLogger,
    ZodTypeProvider
>;