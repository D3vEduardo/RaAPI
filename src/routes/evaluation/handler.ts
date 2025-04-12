import { prisma } from "#libs/prisma.js";
import chalk from "chalk";
import { consola } from "consola";
import { z } from "zod";
import { firebaseAuth } from "#libs/firebase/firebase.js";
import { evaluationType, authorType } from "#types/evaluationZodType.js";
import { FastifyTypedInstace } from "#types/FastifyTypedInstace.js";
import { BearerTokenIsValid } from "#utils/bearerTokenIsValid.js";
import { Evaluation } from "@prisma/client";

export default async function (server: FastifyTypedInstace) {
  server.get(
    "/",
    {
      schema: {
        summary: "Endpoint para pegar todas as avaliações ou a de um usuário.",
        tags: ["Evaluation"],
        description: "Pega todas as avaliações ou a de um usuário.",
        headers: z.object({
          authorization: z
            .string({
              message: "O token de autenticação não foi informado!",
            })
            .optional(),
        }),
        querystring: z.object({
          page: z.coerce
            .number({
              message: "A página deve ser um número válido!",
            })
            .optional()
            .default(1),
          pageSize: z.coerce
            .number({
              message: "O tamanho da página deve ser um número válido!",
            })
            .min(1, {
              message: "O tamanho da página deve ser maior ou igual a 1.",
            })
            .max(20, {
              message: "O tamanho da página deve ser menor ou igual a 20.",
            })
            .optional()
            .default(10),
          minValue: z.coerce
            .number({
              message: "O valor mínimo deve ser um número válido!",
            })
            .min(1, {
              message: "O valor mínimo deve ser entre 1 e 5.",
            })
            .max(5, {
              message: "O valor mínimo deve ser entre 1 e 5.",
            })
            .optional()
            .default(1),
          maxValue: z.coerce
            .number()
            .min(1, {
              message: "O valor máximo deve ser entre 1 e 5.",
            })
            .max(5, {
              message: "O valor máximo deve ser entre 1 e 5.",
            })
            .optional()
            .default(5),
          randomized: z.coerce
            .boolean({
              message: "Randomized deve ser um Boolean.",
            })
            .optional()
            .default(false),
        }),
        response: {
          200: z.object({
            message: z.string(),
            evaluations: z.array(evaluationType).optional(),
            authors: z.array(authorType).optional(),
            evaluation: evaluationType.optional(),
          }),
          500: z.object({
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      try {
        const { page, pageSize, minValue, maxValue, randomized } = req.query;
        const { authorization } = req.headers;

        console.log(randomized);

        const { valid: accessTokenIsValid, token: accessToken } =
          BearerTokenIsValid(authorization);

        if (accessToken && accessTokenIsValid) {
          const user = await firebaseAuth
            .verifyIdToken(accessToken)
            .catch(() => {
              return res.status(401).send({
                message: "Token informado inválido! Não autorizado!",
              });
            });

          const userEvaluation = await prisma.evaluation.findUnique({
            where: {
              authorId: user.uid,
            },
          });

          if (!userEvaluation) {
            return res.status(404).send({
              message: `Você não possuí nenhuma avaliação!`,
            });
          }

          return res.status(200).send({
            message: "Sucesso ao pegar sua avaliação!",
            evaluation: userEvaluation,
          });
        }

        if (minValue > maxValue) {
          return res.status(400).send({
            message: "O valor mínimo não pode ser maior que o valor máximo!",
          });
        }

        let evaluations: Evaluation[];

        if (randomized) {
          evaluations = (
            await prisma.evaluation.findMany({
              take: pageSize + 10,
            })
          )
            .sort(() => Math.random() - 0.5)
            .slice(0, pageSize);
        } else {
          evaluations = await prisma.evaluation.findMany({
            where: {
              value: {
                gte: minValue,
                lte: maxValue,
              },
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
          });
        }

        if (evaluations.length == 0) {
          return res.status(404).send({
            message: "Nenhuma avaliação encontrada!",
          });
        }

        const authors = (
          await Promise.all(
            evaluations.map(async (evaluation, index) => {
              const author = await firebaseAuth
                .getUser(evaluation.authorId)
                .catch(async () => {
                  await prisma.evaluation.delete({
                    where: {
                      id: evaluation.id,
                    },
                  });
                  evaluations.splice(index, 1);
                });

              if (!author) return;
              return {
                uid: author.uid,
                displayName: author.displayName,
                photoURL: author.photoURL,
              };
            }),
          )
        ).filter((author): author is NonNullable<typeof author> =>
          Boolean(author),
        );

        return res.status(200).send({
          message: "Avaliações encontradas!",
          evaluations,
          authors,
        });
      } catch (e) {
        consola.error(chalk.red("Ocorreu um erro ao pegar as avaliações", e));
        return res.status(500).send({
          message: "Ocorreu um erro ao pegar as avaliações",
        });
      }
    },
  );

  server.post(
    "/",
    {
      schema: {
        tags: ["Evaluation"],
        description: "Cria uma nova avaliação",
        summary: "Cria uma avaliação.",
        headers: z.object({
          authorization: z.string({
            message: "O token de autenticação não foi informado!",
          }),
        }),
        body: z.object({
          value: z
            .number({
              message: "Você deve informar o valor da avaliação.",
            })
            .min(0, "O valor da avaliação deve ser maior que 0.")
            .max(5, "O valor da avaliação deve ser menor que 5."),
          content: z
            .string({
              message: "Você deve informar o conteúdo da mensagem.",
            })
            .max(
              1000,
              "O conteúdo da avaliação deve ter no máximo 1000 caracteres.",
            ),
        }),
        response: {
          201: z.object({
            message: z.string(),
            evaluation: evaluationType,
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { authorization } = req.headers;
      const { value, content } = req.body;
      const { valid: accessTokenIsValid, token: accessToken } =
        BearerTokenIsValid(authorization);
      if (!accessTokenIsValid || !accessToken) {
        return res.status(401).send({
          message: "Token informado de forma inválida! Não autorizado!",
        });
      }
      const user = await firebaseAuth.verifyIdToken(accessToken).catch(() => {
        return res.status(401).send({
          message: "Token inválido! Não autorizado!",
        });
      });

      if (!user.email) {
        return res.status(401).send({
          message: "Usuário não autenticado! Não autorizado!",
        });
      }

      const userEvaluationExists = !!(await prisma.evaluation.findUnique({
        where: {
          authorId: user.uid,
        },
      }));

      if (userEvaluationExists) {
        return res.status(409).send({
          message: "Você já possuí uma avaliação!",
        });
      }

      const evaluation = await prisma.evaluation.create({
        data: {
          value,
          content,
          authorId: user.uid,
        },
      });

      return res.status(201).send({
        message: "Avaliação criada com sucesso!",
        evaluation,
      });
    },
  );

  server.put(
    "/",
    {
      schema: {
        summary: "Atualiza uma avaliação.",
        description: "Endpoint para atualizar uma avaliação.",
        tags: ["Evaluation"],
        headers: z.object({
          authorization: z.string({
            message: "O token de autenticação não foi informado!",
          }),
        }),
        body: z.object({
          value: z.coerce
            .number({
              message: "O valor da avaliação deve ser um número válido!",
            })
            .min(1, {
              message: "O valor da avaliação deve ser maior ou igual 1!",
            })
            .max(5, {
              message: "O valor da avaliação deve ser menor ou igual a 5!",
            }),
          content: z.string({
            message: "O conteúdo deve ser informado!",
          }),
        }),
        response: {
          200: z.object({
            message: z.string(),
            evaluation: evaluationType,
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { authorization } = req.headers;
      const { content, value } = req.body;

      const { token: accessToken, valid } = BearerTokenIsValid(authorization);

      if ((accessToken && !valid) || !accessToken) {
        return res.status(401).send({
          message: "Token não informado ou inválido!",
        });
      }

      const user = await firebaseAuth.verifyIdToken(accessToken).catch(() => {
        return res.status(401).send({
          message: "Token informado inválido ou expirado!",
        });
      });

      const evaluation = await prisma.evaluation.upsert({
        where: {
          authorId: user.uid,
        },
        update: {
          value,
          content,
        },
        create: {
          value,
          content,
          authorId: user.uid,
        },
      });

      return res.status(200).send({
        message: "Avaliação atualizada com sucesso!",
        evaluation,
      });
    },
  );

  server.delete(
    "/",
    {
      schema: {
        tags: ["Evaluation"],
        description: "Endpoint para deletar uma avaliação.",
        summary: "Deletar avaliação.",
        headers: z.object({
          authorization: z.string({
            message: "O token de autenticação não foi informado!",
          }),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { authorization } = req.headers;

      const { valid: accessTokenIsValid, token: accessToken } =
        BearerTokenIsValid(authorization);
      if (!accessTokenIsValid || !accessToken) {
        return res.status(401).send({
          message: "Token informado de forma inválida! Não autorizado!",
        });
      }

      const user = await firebaseAuth.verifyIdToken(accessToken).catch(() => {
        return res.status(401).send({
          message: "Token de autenticação inválido! Não autorizado!",
        });
      });

      if (!user.email) {
        return res.status(401).send({
          message: "Usuário inexistente! Não autorizado!",
        });
      }

      const userEvaluationExists = !!(await prisma.evaluation.findUnique({
        where: {
          authorId: user.uid,
        },
      }));

      if (!userEvaluationExists) {
        return res.status(404).send({
          message: "Você não possuí nenhuma avaliação!",
        });
      }

      await prisma.evaluation.delete({
        where: {
          authorId: user.uid,
        },
      });

      return res.status(200).send({
        message: "Avaliação deletada com sucesso!",
      });
    },
  );
}
