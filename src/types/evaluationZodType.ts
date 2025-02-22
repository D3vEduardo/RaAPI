import { z } from "zod";

export const evaluationType = z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    value: z.number().min(0).max(5),
    content: z.string(),
    authorEmail: z.string().email(),
})

// id         String @id @default(cuid())
//   createdAt  DateTime @default(now())
//   updatedAt  DateTime @updatedAt
//   value      Int @default(0)
//   content    String
//   authorEmail String @unique