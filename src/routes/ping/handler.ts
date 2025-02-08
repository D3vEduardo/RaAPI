import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {pingOptions} from "@routes/ping/options.js";

export default async function handler(server: FastifyTypedInstance) {
    server.get("/",
        pingOptions,
        (req, res) => {
        res.send({ message: "Ping" });
    })
}