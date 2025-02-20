import {fastify} from "fastify";
import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {consola} from "consola";
import {config} from "dotenv";
import chalk from "chalk";
config();


export class App {
    app: FastifyTypedInstance;

    constructor() {
        this.app = fastify();
    }

    async listen() {

        const port  = Number(process.env.PORT) || 2323;

        try {
            console.log(chalk.gray("........................................."))
            consola.info("Ra Rate API is starting...");
            await this.app.listen({
                port,
                host: "0.0.0.0",
            });
            consola.success(chalk.green("HTTP Server is running on port", port));
            console.log(chalk.gray("........................................."))
        } catch (err) {
            consola.error(chalk.red("Error starting HTTP server:\n"), err);
            process.exit(1);
        }
    }
}