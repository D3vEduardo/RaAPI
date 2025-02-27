import { z } from "zod";

export const evaluationType = z.object({
    id: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
    value: z.number().min(0).max(5),
    content: z.string(),
    authorId: z.string(),
})

export const authorType = z.object({
    uid: z.string(),
    displayName: z.string().optional(),
    photoURL: z.string().url().optional(),
});

// Promise<{     evaluation: {         value: number         id: number         createdAt: Date         updatedAt: Date         content: string         authorId: string     }     author: void | UserRecord }>[]