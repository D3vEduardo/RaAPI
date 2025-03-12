import { FastifyTypedInstace } from "#/types/FastifyTypedInstace.js";
import { fastifySwagger } from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export function configureSwagger(server: FastifyTypedInstace) {
    server.register(fastifySwagger, {
        prefix: "/docs",
        openapi: {
            info: {
                title: "RA Evaluation API",
                description: "API de avaliação para web-site da RA Intalações Elétricas",
                version: "1.0.0"
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                }
            },
            security: [{ bearerAuth: [] }]
        },
        transform: jsonSchemaTransform
    });

    server.register(fastifySwaggerUi, {
        routePrefix: "/docs",
    });
}