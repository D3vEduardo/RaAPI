import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {fastifySwagger, SwaggerOptions} from "@fastify/swagger";
import {fastifySwaggerUi, FastifySwaggerUiOptions} from "@fastify/swagger-ui";
import {consola} from "consola";
import chalk from "chalk";

export function configureSwagger(server: FastifyTypedInstance) {

    const swaggerOptions: SwaggerOptions = {
        openapi: {
            info: {
                title: "Ra Rate API",
                description: "API para avaliação do serviço da Ra Instalações Elétricas.",
                version: "1.0.0"
            }
        }
    }

    server.register(fastifySwagger, swaggerOptions);

    const swaggerUiOptions: FastifySwaggerUiOptions = {
        routePrefix: "/docs"
    }

    server.register(fastifySwaggerUi, swaggerUiOptions);

    consola.log(".........................................");
    consola.info("Swagger Info:")
    consola.success(chalk.green("Swagger UI is running in /docs"));
    console.table(swaggerOptions.openapi!.info);
}