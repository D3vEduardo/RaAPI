import { firebaseAuth } from "#libs/firebase/firebase.js";
import { FastifyTypedInstace } from "#types/FastifyTypedInstace.js";
import { z } from "zod";

export default async function (server: FastifyTypedInstace) {
    server.get("/:userEmail", {
        schema: {
            tags: ["User"],
            summary: "Endpoint para pegar dados públicos de um user",
            description: "Pega os dados públicos de um user",
            params: z.object({
                userEmail: z.string({
                    message: "Você deve informar o email!"
                }).email({
                    message: "O email informado é inválido!"
                })
            }),
            response: {
                403: z.object({
                    message: z.string()
                }),
                200: z.object({
                    message: z.string(),
                    user: z.object({
                        email: z.string().optional(),
                        displayName: z.string().optional(),
                        photoURL: z.string().optional()
                    })
                })
            }
        }
    }, async (req, res) => {
        const { userEmail } = req.params;
        const { email, displayName, photoURL } = await firebaseAuth.getUserByEmail(userEmail).catch(() => {
            return res.status(403).send({
                message: "Nenhum usuário logado com esse email!"
            });
        });

        return res.status(200).send({
            message: "Busca realizada com sucesso!",
            user: {
                email,
                displayName,
                photoURL
            }
        });

    });
} 