import { z } from 'zod'

export const baseSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
})