import { FastifyTypedInstace } from "#/types/FastifyTypedInstace.js";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";

export function configureTypeProvider(server: FastifyTypedInstace) {
    server.withTypeProvider<ZodTypeProvider>();
    server.setSerializerCompiler(serializerCompiler);
    server.setValidatorCompiler(validatorCompiler);
}