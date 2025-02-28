import { z } from 'zod'
import { baseSchema } from './base'
import { controlSchema } from './control'

export const roomSchema = baseSchema.extend({
    roomId: z.string(),
    host: z.array(z.string()).optional(),
    control: controlSchema.optional(),
    peoples: z.array(z.any()).optional(),
    peopleWaiting: z.array(z.any()).optional(),
})

export type Room = z.infer<typeof roomSchema>