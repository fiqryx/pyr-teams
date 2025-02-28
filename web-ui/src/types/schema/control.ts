import { z } from 'zod'
import { baseSchema } from './base'

export const controlSchema = baseSchema.extend({
    hostManagement: z.boolean(),
    allowShareScreen: z.boolean(),
    allowSendChat: z.boolean(),
    allowReaction: z.boolean(),
    allowMicrophone: z.boolean(),
    allowVideo: z.boolean(),
    requireHost: z.boolean(),
    access: z.enum(['open', 'trusted']),
})

export type Control = z.infer<typeof controlSchema>