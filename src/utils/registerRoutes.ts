import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {pathToFileURL} from "node:url";
import * as fs from "node:fs";
import path from "node:path";
import {consola} from "consola";
import chalk from "chalk";

let registeredRoutes: string[] = [];
let unregisteredRoutes: string[] = [];

export async function registerRoutes(server: FastifyTypedInstance, routesPath: string, prefix="") {
    if (prefix != "") consola.info(`Registrando rota ${prefix}`);
    if (!fs.existsSync(routesPath)) {
        consola.error(chalk.red("Caminho para a pasta de rotas não existe!"));
        return;
    }

    const items = fs.readdirSync(routesPath);

    for (const item of items) {
        const itemPath = path.join(routesPath, item);
        const itemIsDir = fs.statSync(itemPath).isDirectory();
        const itemIsFile = fs.statSync(itemPath).isFile();

        if (itemIsDir) {
            await registerRoutes(server, itemPath, `${prefix}/${item}`);
            return;
        }

        if (itemIsFile && item == "handler.ts") {
            const routeUrl = pathToFileURL(itemPath).href;
            const route = await import(routeUrl);

            if (!route.default) {
                consola.error(chalk.red("Nenhuma rota é exportada!"));
                return;
            }

            try {
                server.register(route.default, {
                    prefix
                });
                registeredRoutes.push(`"${prefix}"`)
            } catch (e) {
                unregisteredRoutes.push(`"${prefix}"`);
                return
            }
        }
    }

    console.log(chalk.gray("........................................."))
    consola.info("LOGS - Registro de rotas:")
    if (registeredRoutes.length > 0) {
        consola.success(chalk.green(`${registeredRoutes.length} rotas registradas com sucesso!`));
        consola.log("Rotas registradas:", ...registeredRoutes);
    } else {
        consola.error(chalk.red("Nenhuma rota foi registrada!"));
    }

    if (unregisteredRoutes.length > 0) {
        consola.error(chalk.red(`${unregisteredRoutes.length} rotas não registradas!`));
        consola.log("Rotas não registradas:", ...registeredRoutes);
    }
}