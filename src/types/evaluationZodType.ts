import { z } from "zod";

export const evaluationType = z.object({
    id: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
    value: z.number().min(0).max(5),
    content: z.string(),
    authorId: z.string(),
})
