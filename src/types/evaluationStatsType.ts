import { z } from "zod";
import { evaluationType } from "./evaluationZodType.js";

export type EvaluationStatsType = {
  category: EvaluationStatsCategoryType;
  qtd: number;
};

export type EvaluationStatsCategoryType =
  | "Péssimo"
  | "Ruim"
  | "Bom"
  | "Muito bom"
  | "Excelente";

export type EvaluationsStatsType = EvaluationStatsType[] & {
  evaluationsQtd: number;
};

export const evaluationStatsTypeSchema = z.object({
  category: z.string(),
  qtd: z.number(),
});

export const evaluationsStatsTypeSchema = z.object({
  evaluationsQtd: z.number(),
  evaluationsStats: z.array(evaluationStatsTypeSchema),
});
