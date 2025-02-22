import { FastifyTypedInstace } from "#/types/FastifyTypedInstace.js";
import { z } from "zod";

export default function (server: FastifyTypedInstace) {
    server.get("/",
        {
            schema: {
                tags: ["Ping"],
                summary: "Ping endpoint",
                response: {
                    200: z.object({
                        message: z.string()
                    })
                }
            }
        }, async (req, res) => {
            return res.status(200).send({ message: "Pong!" });
        });
}