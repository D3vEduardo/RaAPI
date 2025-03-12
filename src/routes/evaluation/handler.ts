import { prisma } from "#libs/prisma.js";
import chalk from "chalk";
import { consola } from "consola";
import { z } from "zod";
import { evaluationType, authorType } from "#types/evaluationZodType.js";
import { firebaseAuth } from "#libs/firebase/firebase.js";
import { FastifyTypedInstace } from "#src/types/FastifyTypedInstace.js";
import * as console from "node:console";

export default async function (server: FastifyTypedInstace) {
    server.get("/", {
        schema: {
            summary: "Endpoint para pegar todas as avaliações ou a de um usuário.",
            tags: ["Evaluation"],
            description: "Pega todas as avaliações ou a de um usuário.",
            querystring: z.object({
                accessToken: z.string().optional(),
                page: z.string().optional(),
                pageSize: z.string().optional(),
                minValue: z.string().optional(),
                maxValue: z.string().optional(),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                    evaluations: z.array(evaluationType).optional(),
                    authors: z.array(authorType).optional(),
                    evaluation: evaluationType.optional()
                }),
                500: z.object({
                    message: z.string()
                }),
                400: z.object({
                    message: z.string()
                }),
            }
        }
    }, async (req, res) => {
        try {
            const { accessToken, page, pageSize, minValue, maxValue } = req.query;

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

            const parsedMinValue = minValue ? Math.floor(Number(minValue)) : undefined;
            const parsedMaxValue = maxValue ? Math.floor(Number(maxValue)) : undefined;

            if ((parsedMinValue && parsedMaxValue) && parsedMinValue > parsedMaxValue) {
                return res.status(400).send({
                    message: "O valor mínimo não pode ser maior que o valor máximo!"
                });
            }

            const parsedPage = Math.floor(Number(page)) || 1;
            const parsedPageSize = Math.floor(Number(pageSize)) || 10;

            const evaluations = await prisma.evaluation.findMany({
                where: {
                    value: {
                        gte: parsedMinValue ?? 0,
                        lte: parsedMaxValue ?? 5
                    },
                },
                skip: (parsedPage - 1) * parsedPageSize,
                take: parsedPageSize
            });

            if (evaluations.length == 0) {
                return res.status(400).send({
                    message: "Nenhuma avaliação encontrada!"
                });
            }

            const authors = (await Promise.all(
                evaluations.map(async (evaluation, index) => {
                    const author = await firebaseAuth.getUser(evaluation.authorId).catch(async () => {
                        await prisma.evaluation.delete({
                            where: {
                                id: evaluation.id
                            }
                        });
                        evaluations.splice(index, 1);
                    });

                    if (!author) return;
                    return {
                        uid: author.uid,
                        displayName: author.displayName,
                        photoURL: author.photoURL,
                    };
                })
            )).filter((author): author is NonNullable<typeof author> => Boolean(author));

            return res.status(200).send({
                message: "Avaliações encontradas!",
                evaluations,
                authors
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
                authorization: z.string({
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
                authorization: z.string({
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
                authorization: z.string({
                    message: "O token de autenticação não foi informado!"
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