'use server'
import { roomSchema } from '@/types/schema/room'
import { createClient } from '@/lib/supabase/server'

type GetRoom = { host: boolean, room: any }

export async function getRoom(roomId: string) {
    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getSession()

        if (!data.session) {
            return { error: 'unauthorized' }
        }

        const res = await fetch(process.env.NEXT_PUBLIC_API_URL! + `/api/room/${roomId}`, {
            headers: {
                "Authorization": `Bearer ${data.session.access_token}`
            }
        })

        if (res.status !== 200) {
            throw new Error("Invalid code or link");
        }

        const json = await res.json() as GetRoom

        return {
            error: null,
            host: json.host,
            room: roomSchema.parse(json.room)
        }
    } catch (error) {
        // console.log({ error });
        return { error: (error as Error).message }
    }
}

export async function createRoom(): Promise<{ room?: string, error: string | null }> {
    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getSession()

        if (!data.session) {
            return { error: 'unauthorized' }
        }

        const res = await fetch(process.env.NEXT_PUBLIC_API_URL! + '/api/room/create', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${data.session.access_token}`
            }
        })

        if (res.status !== 201) {
            throw new Error("Failed create room");
        }

        return await res.json()
    } catch (error) {
        // console.log({ error });
        return { error: (error as Error).message }
    }
}