import { z } from "zod"

export const userSchema = z.object({
    id: z.string(),
    provider: z.string(),
    photo: z.string().optional(),
    name: z.string(),
    email: z.string()
})

export type User = z.infer<typeof userSchema>