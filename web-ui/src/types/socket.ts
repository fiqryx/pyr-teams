import { People } from "./stream"

/**
 * @key room id
 * @value T
 */
export type SetRecord<T> = Record<string, Set<T>>

export type JoinRoom = {
    roomId: string
    user: People
}

export type EmitRoom<T extends object = any> = {
    roomId: string
    peerId?: string
} & T