'use client'
import React from "react"
import { useAuthStore } from "@/stores/auth"
import { useSupabaseClient } from "@/lib/supabase/client"

export function AuthProvider({ children }: React.PropsWithChildren) {
    const supabase = useSupabaseClient()
    const { user, set } = useAuthStore()

    async function getUser() {
        const { data } = await supabase.auth.getUserIdentities()

        if (data?.identities) {
            const { user_id, provider, identity_data } = data.identities[0]

            set({
                user: {
                    provider,
                    id: user_id,
                    email: identity_data?.email,
                    photo: identity_data?.avatar_url,
                    name: identity_data?.full_name,
                }
            })
        }
    }

    React.useEffect(() => {
        if (!user) getUser()
    }, [user, supabase])

    return children
}