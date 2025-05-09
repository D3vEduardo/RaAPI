import fastify from "fastify";
import { FastifyTypedInstace } from "./types/FastifyTypedInstace.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { config } from "dotenv";
import consola from "consola";
import chalk from "chalk";
import { firebaseAuth } from "./libs/firebase/firebase.js";
import { Auth } from "firebase-admin/auth";
import { Database } from "firebase-admin/database";
config();

export class App {
    app: FastifyTypedInstace;
    auth: Auth;

    constructor() {
        this.app = fastify();
        this.auth = firebaseAuth;
    }

    public async listen() {
        const port = Number(process.env.PORT) || 27444;
        this.app.listen({
            port,
            host: "0.0.0.0"
        }, (err, address) => {
            if (err) {
                consola.error(chalk.red("Failed to start server!", err));
                process.exit(1);
            }

            consola.success(chalk.green(`HTTP Server is running on port ${port}.`));
            consola.info(chalk.blue(`Url: ${address}`));
        })

    }
}