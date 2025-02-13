import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {serializerCompiler, validatorCompiler} from "fastify-type-provider-zod";

export function configureTypeProviderZod(server: FastifyTypedInstance) {
    server.setSerializerCompiler(serializerCompiler);
    server.setValidatorCompiler(validatorCompiler);
}