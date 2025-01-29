import { FastifyTypedInstance } from "@/types/FastifyTypedInstance.js";
import {z} from "zod";

function pingRoute(server: FastifyTypedInstance) {
    server.get("/",
        {
            schema: {
                response: {
                    200: z.object({
                        message: z.string()
                    }),
                }
            }
        }
        ,(req, res) => {
        res.send({ message: "Ping!" });
    });

    server.get("/helloworld",
        {
            schema: {
                response: {
                    200: z.object({
                        message: z.string()
                    }),
                }
            }
        }
        , (req, res) => {
        res.send({ message: "Hello World!" });
    })
}

export { pingRoute };