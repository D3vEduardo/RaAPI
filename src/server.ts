import { startRegisterRoutes } from "#utils/registerRoutes.js";
import { config } from "dotenv";
import { App } from "./app.js";
import { configureTypeProvider } from "#utils/configureTypeProvider.js";
import { configureCors } from "#utils/configureCors.js";
import { configureSwagger } from "./utils/configureSwagger.js";
import {configureRateLimit} from "#utils/configureRateLimit.js";

config();

const app = new App();
const server = app.app;

configureTypeProvider(server);
configureCors(server);
configureRateLimit(server);
configureSwagger(server);
await startRegisterRoutes(server);

await app.listen();