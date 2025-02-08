import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {registerRoutes} from "@utils/registerRoutes.js";
import {configureTypeProviderZod} from "@utils/configureTypeProviderZod.js";
import {configureCors} from "@utils/configureCors.js";
import {configureRateLimit} from "@utils/configureRateLimit.js";
import {configureSwagger} from "@utils/configureSwagger.js";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesPath = path.join(__dirname, "../routes");

export async function configureServer(server: FastifyTypedInstance) {
    await registerRoutes(server, routesPath);
    configureTypeProviderZod(server);
    configureCors(server);
    configureRateLimit(server)
    configureSwagger(server);
}
