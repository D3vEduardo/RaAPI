import { firebaseAuth } from "#libs/firebase/firebase.js";
import { FastifyTypedInstace } from "#types/FastifyTypedInstace.js";
import { z } from "zod";

export default async function (server: FastifyTypedInstace) {
    server.get("/:userId", {
        schema: {
            tags: ["User"],
            summary: "Endpoint para pegar dados públicos de um user",
            description: "Pega os dados públicos de um user",
            params: z.object({
                userId: z.string({
                    message: "Você deve informar o id do usuario!"
                }).uuid({
                    message: "O id informado é inválido!"
                })
            }),
            response: {
                404: z.object({
                    message: z.string()
                }),
                200: z.object({
                    message: z.string(),
                    user: z.object({
                        uid: z.string().optional(),
                        displayName: z.string().optional(),
                        photoURL: z.string().optional()
                    })
                })
            }
        }
    }, async (req, res) => {
        const { userId } = req.params;
        const user = await firebaseAuth.getUser(userId)
            .catch(() => {
                return null;
            });

        if (!user) {
            return res.status(404).send({
                message: "Usuário não encontrado!"
            });
        }

        const { uid, displayName, photoURL } = user;

        return res.status(200).send({
            message: "Busca realizada com sucesso!",
            user: {
                uid,
                displayName,
                photoURL
            }
        });

    });
}
