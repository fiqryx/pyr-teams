'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { useRoom } from '@/stores/room'

import { Button } from '@/components/ui/button'
import { Countdown } from '@/components/ui/extends/countdown';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function Leave({
    children,
    asChild,
    className,
    ...props
}: React.ComponentProps<typeof DialogContent>) {
    const { socket, peer, peerId, roomId, leave, setRoom } = useRoom()

    React.useEffect(() => {
        if (leave) {
            socket.emit("user:leave", { peerId, roomId })
            peer?.destroy()
            socket.disconnect()
        }
    }, [leave])

    return (
        <Dialog
            open={leave}
            onOpenChange={(leave) => setRoom({ leave })}
        >
            <DialogTrigger asChild={asChild}>
                {children}
            </DialogTrigger>
            <DialogContent
                {...props}
                className={cn(
                    'w-full h-full max-w-none data-[state=open]:rounded-none',
                    className
                )}
            >
                <DialogHeader className='gap-4'>
                    <div className="inline-flex items-center gap-2">
                        <Countdown
                            size="xs"
                            timeleft={60}
                            onComplete={() => {
                                window.location.href = '/'
                            }}
                        />
                        <DialogTitle className='text-xs font-medium'>
                            Returning to home screen
                        </DialogTitle>
                    </div>
                </DialogHeader>
                <div className="flex flex-col items-center text-center gap-2">
                    <h1 className='text-2xl md:text-3xl font-semibold'>You left the meeting</h1>
                    <DialogDescription className="mb-8">
                        Rejoin anytime with the invite link.
                        Thanks for being here!
                    </DialogDescription>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Rejoin
                        </Button>
                        <Button onClick={() => {
                            window.location.href = '/'
                        }}>
                            Retrun to home screen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}