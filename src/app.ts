import {fastify, FastifyInstance} from "fastify";
import {fastifySwagger, SwaggerOptions} from "@fastify/swagger";
import {fastifySwaggerUi, FastifySwaggerUiOptions} from "@fastify/swagger-ui";
import {SECRET_KEY, SERVER_PORT} from "@lib/dotenv.js";
import {validatorCompiler, serializerCompiler, jsonSchemaTransform} from "fastify-type-provider-zod"
import {fastifyCors} from "@fastify/cors";
import {pingRoute} from "@/routes/ping.js";
import {userRoutes} from "@/routes/user.js";
import { fastifyJwt } from "@fastify/jwt";
import { fastifyMultipart } from "@fastify/multipart";

class App {
    public app: FastifyInstance;

    constructor() {
        this.app = fastify();
        this.configureZod();
        this.configureCors();
        this.configureSwagger();
        this.registerRoutes();
        this.configureJwt();
        this.configureFastifyMultipart()
    }

    configureCors() {
        this.app.register(fastifyCors, {
            origin: "*"
        })
    }

    configureZod() {
        this.app.setSerializerCompiler(serializerCompiler);
        this.app.setValidatorCompiler(validatorCompiler);
    }

    configureSwagger() {
        this.app.register(fastifySwagger, {
            openapi: {
                info: {
                    title: "Ra Rate API",
                    description: "API de avaliação do site da RA Instalações Elétricas.",
                    version: "1.0.0"
                }
            },
            transform: jsonSchemaTransform
        });

        this.app.register(fastifySwaggerUi, {
            routePrefix: "/docs",
        });

        this.app.ready().then(() => {
            this.app.swagger();
        })
    }

    registerRoutes() {
        this.app.register(pingRoute);
        this.app.register(userRoutes);
    }

    configureJwt() {
        this.app.register(fastifyJwt, {
            secret: SECRET_KEY
        });
    }

    configureFastifyMultipart() {
        this.app.register(fastifyMultipart, {
            limits: { fileSize: 5 * 1024 * 1024 },
        });
    }

    public async listen() {
        try {
            await this.app.listen({
                port: Number(SERVER_PORT) || 2323,
                host: "0.0.0.0"
            });
            console.log("HTTP Server running on port 2323");
        } catch (err) {
            console.log(err);
            process.exit(1);
        }
    }
}

export { App }