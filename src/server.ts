import {App} from "@/app.js";
import {configureServer} from "@utils/configureServer.js";

const server = new App();

await configureServer(server.app);

await server.listen();