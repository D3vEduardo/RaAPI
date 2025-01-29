import {
    FastifyInstance,
    RawRequestDefaultExpression,
    RawServerDefault,
    RawReplyDefaultExpression, FastifyBaseLogger
} from "fastify";
import {ZodTypeProvider} from "fastify-type-provider-zod";


type FastifyTypedInstance = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    FastifyBaseLogger,
    ZodTypeProvider
>;

export {FastifyTypedInstance};