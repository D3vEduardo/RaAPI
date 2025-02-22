import { FastifyTypedInstace } from "#types/FastifyTypedInstace.js";
import path from "path";
import * as fs from "fs";
import consola from "consola";
import { fileURLToPath, pathToFileURL } from "url";
import chalk from "chalk";
import { logsSeparator } from "./logsSeparator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let registeredRoutes: string[] = [];
let unregisteredRoutes: string[] = [];

export async function registerRoutes(server: FastifyTypedInstace, routesPath = path.join(__dirname, "../routes"), prefix = "") {
    const items = fs.readdirSync(routesPath);
    for (const item of items) {
        const itemPath = path.join(routesPath, item);
        const itemStats = fs.statSync(itemPath);

        if (itemStats.isDirectory()) {
            await registerRoutes(server, itemPath, prefix + "/" + item);
            continue;
        }
        if (item == "handler.ts" || item == "handler.js") {
            try {
                const routeUrl = pathToFileURL(itemPath).href;
                const route = await import(routeUrl);
                if (!route.default) {
                    consola.error("Route handler not found in " + itemPath);
                    unregisteredRoutes.push(prefix);
                    continue;
                }
                server.register(route.default, { prefix });
                registeredRoutes.push(`"${prefix == "" ? prefix + "/" : prefix}"`);
            } catch (error) {
                consola.error(error);
                unregisteredRoutes.push(`"${prefix == "" ? prefix + "/" : prefix}"`);
                continue;
            }
        }
    }
}

export async function startRegisterRoutes(server: FastifyTypedInstace) {
    consola.info(chalk.blue("Registering routes..."));
    await registerRoutes(server);
    if (unregisteredRoutes.length > 0) {
        consola.log(chalk.red(registeredRoutes.length + " unregistered routes."));
        consola.info(chalk.blue(`Unregistered routes: ${unregisteredRoutes.join(", ")}.`));
    }
    if (registeredRoutes.length == 0) {
        consola.warn(chalk.yellow(registeredRoutes.length + " registered routes."));
        return;
    }
    consola.success(chalk.green(registeredRoutes.length + " routes registered."))
    consola.info(chalk.blue(`Registered routes: ${registeredRoutes.join(", ")}.`));
    logsSeparator();
}