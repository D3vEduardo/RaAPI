import { prisma } from "#libs/prisma.js";
import {
  evaluationsStatsTypeSchema,
  EvaluationStatsCategoryType,
  EvaluationStatsType,
  evaluationStatsTypeSchema,
} from "#types/evaluationStatsType.js";
import { FastifyTypedInstace } from "#types/FastifyTypedInstace.js";
import { z } from "zod";

export default function (server: FastifyTypedInstace) {
  server.get(
    "/",
    {
      schema: {
        tags: ["Evaluation", "Evaluation Stats"],
        summary: "Pega estatísticas das avaliações.",
        description: "Pega estatísticas das avaliações.",
        response: {
          200: z.object({
            message: z.string(),
            stats: evaluationsStatsTypeSchema,
          }),
          500: z.object({
            message: z.string(),
            error: z.unknown(),
          }),
        },
      },
    },
    async (req, res) => {
      try {
        const evaluationsQtd = await prisma.evaluation.count();
        const groupedEvaluations = await prisma.evaluation.groupBy({
          by: ["value"],
          _count: { value: true },
        });
        const evaluationCategories: EvaluationStatsCategoryType[] = [
          "Péssimo",
          "Ruim",
          "Bom",
          "Muito bom",
          "Excelente",
        ];
        const evaluationsStats: EvaluationStatsType[] = await Promise.all(
          evaluationCategories.map((category, index) => {
            const countObj = groupedEvaluations.find(
              (g) => g.value == index + 1,
            );
            return {
              qtd: countObj?._count.value || 0,
              category,
            };
          }),
        );

        const stats = {
          evaluationsQtd,
          evaluationsStats: evaluationsStats,
        };

        return res.status(200).send({
          message: "Estatísticas de avaliações enviadas com sucesso!",
          stats: stats,
        });
      } catch (e) {
        return res.status(500).send({
          message: "Ocorreu um erro ao buscar as estatísticas das avaliações",
          error: e,
        });
      }

      // Fim da rota GET
    },
  );
}
