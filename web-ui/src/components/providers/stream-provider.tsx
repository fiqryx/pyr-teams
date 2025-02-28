'use client'
import React from 'react'
import { cn, delay } from '@/lib/utils'

import { useAppStore } from '@/stores/app'
import { useStream } from '@/stores/stream'
import { Loading } from '@/components/ui/loading'

interface Props {
    className?: string
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function StreamProvider({ children, fallback, className }: Props) {
    const app = useAppStore()
    const [init, setInit] = React.useState(false)
    const { media, status, createStream, checkPermission, set } = useStream()

    React.useEffect(() => {
        const initialize = async () => {
            if (init || status !== 'loading') {
                app.set({ loading: false, message: undefined })
                return
            }

            if (!fallback) {
                app.set({
                    loading: true,
                    message: 'Getting ready...'
                })
            }

            if (!media) {
                const granted = await checkPermission()
                if (granted || !fallback) {
                    await createStream()
                }
            } else {
                const [audio, video] = media.getTracks();
                set({
                    status: 'idle',
                    muted: !audio.enabled,
                    visible: video.enabled
                })
            }
            await delay(1000)

            setInit(true)
            app.set({ loading: false, message: undefined })
        }

        initialize()
    }, [init])

    if (status === 'loading' && fallback) {
        return !init ? (
            <Loading
                variant="spinner"
                className={cn('h-screen animate-fade animate-duration-500 animate-delay-300 animate-ease-linear', className)}
            />
        ) : fallback
    }

    return children
}