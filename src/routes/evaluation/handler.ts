import { prisma } from "#libs/prisma.js";
import chalk from "chalk";
import {consola} from "consola";
import { z } from "zod";
import { evaluationType } from "#types/evaluationZodType.js";
import { firebaseAuth } from "#libs/firebase/firebase.js";
import { FastifyTypedInstace } from "#src/types/FastifyTypedInstace.js";

export default async function (server: FastifyTypedInstace) {
    server.get("/", {
        schema: {
            summary: "Endpoint para pegar todas as avaliações ou a de um usuário.",
            tags: ["Evaluation"],
            description: "Pega todas as avaliações ou a de um usuário.",
            querystring: z.object({
                accessToken: z.string().optional()
            }),
            response: {
                200: z.object({
                    message: z.string(),
                    evaluations: z.array(evaluationType).optional(),
                    evaluation: evaluationType.optional()
                }),
                500: z.object({
                    message: z.string()
                }),
                404: z.object({
                    message: z.string()
                })
            }
        }
    }, async (req, res) => {
        try {
            const { accessToken } = req.query;
            if (accessToken) {
                const user = await firebaseAuth.verifyIdToken(accessToken).catch(() => {
                    return res.status(401).send({
                        message: "Token informado inválido! Não autorizado!"
                    });
                });

                const userEvaluation = await prisma.evaluation.findUnique({
                    where: {
                        authorId: user.uid
                    }
                });

                if (!userEvaluation) {
                    return res.status(404).send({
                        message: `Você não possuí nenhuma avaliação!`
                    });
                }

                return res.status(200).send({
                    message: "Sucesso ao pegar sua avaliação!",
                    evaluation: userEvaluation
                });
            }

            const evaluations = await prisma.evaluation.findMany({
                where: {
                    value: { in: [4, 5] }
                }
            });

            return res.status(200).send({
                message: "Avaliações encontradas!",
                evaluations
            });
        } catch (e) {
            consola.error(chalk.red("Ocorreu um erro ao pegar as avaliações", e));
            return res.status(500).send({
                message: "Ocorreu um erro ao pegar as avaliações"
            });
        }
    });

    server.post("/", {
        schema: {
            tags: ["Evaluation"],
            description: "Cria uma nova avaliação",
            summary: "Cria uma avaliação.",
            headers: z.object({
                Authorization: z.string({
                    message: "O token de autenticação não foi informado!"
                })
            }),
            body: z.object({
                value: z.number({
                    message: "Você deve informar o valor da avaliação."
                })
                    .min(0, "O valor da avaliação deve ser maior que 0.")
                    .max(5, "O valor da avaliação deve ser menor que 5."),
                content: z.string({
                    message: "Você deve informar o conteúdo da mensagem."
                }).max(1000, "O conteúdo da avaliação deve ter no máximo 1000 caracteres.")
            }),
            response: {
                201: z.object({
                    message: z.string(),
                    evaluation: evaluationType
                }),
                401: z.object({
                    message: z.string()
                })
            }
        }
    }, async (req, res) => {
        const { authorization } = req.headers;
        const { value, content } = req.body;
        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).send({
                message: "Token informado de forma inválida! Não autorizado!"
            });
        }
        const accessToken = authorization.replace("Bearer ", "");
        const user = await firebaseAuth.verifyIdToken(accessToken).catch(() => {
            return res.status(401).send({
                message: "Token inválido! Não autorizado!"
            });
        });

        if (!user.email) {
            return res.status(401).send({
                message: "Usuário não autenticado! Não autorizado!"
            });
        }

        const evaluation = await prisma.evaluation.create({
            data: {
                value,
                content,
                authorId: user.uid
            }
        });

        return res.status(201).send({
            message: "Avaliação criada com sucesso!",
            evaluation
        });
    });

    server.put("/", {
        schema: {
            tags: ["Evaluation"],
            summary: "Atualiza uma avaliação.",
            description: "Endpoint para atualizar uma avaliação.",
            headers: z.object({
                Authorization: z.string({
                    message: "O token de autenticação não foi informado!"
                })
            }),
            body: z.object({
                value: z.number({
                    message: "Você deve mencionar o valor da avaliação!"
                })
                    .min(0, "O valor da avaliação deve ser maior que 0.")
                    .max(5, "O valor da avaliação deve ser menor que 5."),
                content: z.string({
                    message: "Você deve mencionar o conteúdo da avaliação!"
                }).max(1000, "O conteúdo da avaliação deve ter no máximo 1000 caracteres."),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                    evaluation: evaluationType
                }),
                401: z.object({
                    message: z.string()
                })
            }
        }
    }, async (req, res) => {
        const { authorization } = req.headers;
        const { value, content } = req.body;
        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).send({
                message: "Token informado de forma inválida! Não autorizado!"
            });
        }
        const accessToken = authorization.replace("Bearer ", "");
        const user = await firebaseAuth.verifyIdToken(accessToken).catch(() => {
            return res.status(401).send({
                message: "Token inválido! Não autorizado!"
            });
        });

        if (!user.email) {
            return res.status(401).send({
                message: "Usuário não autenticado! Não autorizado!"
            });
        }

        const updatedEvaluation = await prisma.evaluation.update({
            where: {
                authorId: user.uid
            },
            data: {
                content,
                value
            }
        });

        return res.status(200).send({
            message: "Avaliação atualizada com sucesso!",
            evaluation: updatedEvaluation
        })
    });

    server.delete("/", {
        schema: {
            tags: ["Evaluation"],
            description: "Endpoint para deletar uma avaliação.",
            summary: "Deletar avaliação.",
            headers: z.object({
                Authorization: z.string({
                    message: "Token de autenticação não informado!"
                })
            }),
            response: {
                200: z.object({
                    message: z.string()
                }),
                401: z.object({
                    message: z.string()
                })
            }
        }
    }, async (req, res) => {
        const { authorization } = req.headers;
        const accessToken = authorization.replace("Bearer ", "");
        const user = await firebaseAuth.verifyIdToken(accessToken).catch(() => {
            return res.status(401).send({
                message: "Token de autenticação inválido! Não autorizado!"
            });
        });

        if (!user.email) {
            return res.status(401).send({
                message: "Usuário inexistente! Não autorizado!"
            })
        }

        await prisma.evaluation.delete({
            where: {
                authorId: user.uid
            }
        });

        return res.status(200).send({
            message: "Avaliação deletada com sucesso!"
        });
    });
}