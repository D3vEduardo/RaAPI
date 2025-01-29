import {FastifyTypedInstance} from "@/types/FastifyTypedInstance.js";
import {z} from "zod";
import axios from "axios";
import {IMGUR_CLIENT_ID} from "@lib/dotenv.js";

export async function userRoutes(server: FastifyTypedInstance) {
    server.post("/user/picture/upload", {
        schema: {
            body: z.object({
                file: z.instanceof(Object, {
                    message: "O arquivo é obrigatório."
                }),
            }),
            response: {
                200: z.object({
                    pictureUrl: z.string().url(),
                    message: z.string()
                }),
                500: z.object({
                    message: z.string()
                })
            },
        }
    }, async (req, res) => {
        const file = await req.file();

        if (!file) {
            return res.status(400).send({
                message: "O arquivo é obrigatório."
            });
        }

        const imageBuffer = await file.toBuffer();

        try {
            const imgurRes = await axios.post(
                "https://api.imgur.com/3/upload",
                {
                    image: imageBuffer.toString("base64"),
                    type: "base64"
                },
                {
                    headers: {
                        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
                    }
                }
            );

            const pictureUrl = imgurRes.data.data.link;

            return res.status(200).send({
                message: "Imagem enviada com sucesso.",
                pictureUrl
            })
        } catch (e) {
            console.error(e);
            return res.status(500).send({
                message: "Erro ao fazer upload da imagem."
            })
        }
    })
}