import fastify from "fastify";
import { FastifyTypedInstace } from "./types/FastifyTypedInstace.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { config } from "dotenv";
import consola from "consola";
import chalk from "chalk";
config();

export class App {
    app: FastifyTypedInstace;

    constructor() {
        this.app = fastify();
    }

    public async listen() {
        const port = Number(process.env.PORT) || 27444;
        await this.app.listen({
            port,
            host: "0.0.0.0"
        }).catch(e => {
            consola.error(chalk.red("Failed to start server!", e));
            process.exit(1);
        });
        consola.success(chalk.green(`HTTP Server is running on port ${port}.`));
    }
}