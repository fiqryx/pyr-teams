'use client'
import React from 'react'
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { useAppStore } from '@/stores/app';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { MeetLinkDialog } from './meet-link-dialog';
import { Separator } from "@/components/ui/separator";

import {
    getRoom,
    createRoom
} from '@/app/actions';
import {
    Input,
    InputIcon
} from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Calendar,
    Keyboard,
    Link2,
    Loader2,
    Plus,
    Video
} from "lucide-react";

export function ConnectMeet({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const router = useRouter()
    const { set } = useAppStore()

    const [code, setCode] = React.useState("")
    const [loading, setLoading] = React.useState<'create' | 'join'>()

    async function onCreateRoom() {
        setLoading('create')

        const { error, room } = await createRoom()

        if (error) {
            setLoading(undefined)
            if (error === 'unauthorized')
                router.push('/sign-in')
            else toast(error)
            return
        }

        set({ loading: true })
        router.push(`/${room}`)
    }

    async function onJoinRoom() {
        try {
            setLoading('join')

            const id = code.split('/').pop();
            if (!id) {
                toast('Invalid code or link')
                throw 0
            }

            const { error, room } = await getRoom(id)
            if (error != null) {
                toast(error)
                throw 0
            }

            set({ loading: true })
            router.push(`/${room.roomId}`)
        } finally {
            setLoading(undefined)
        }
    }

    return (
        <div
            {...props}
            className={cn('flex flex-col gap-2 md:gap-4 justify-center', className)}
        >
            <h1 className="text-[2rem] md:text-[2.8rem] font-semibold leading-none">
                Video calls and meetings for everyone
            </h1>
            <div className="text-lg md:text-xl text-muted-foreground max-w-[30rem] mb-4 md:mb-8">
                Connect, collaborate, and celebrate from anywhere with&nbsp;
                <span className="text-nowrap">{process.env.APP_NAME}</span>
            </div>
            <div className="flex flex-wrap gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button disabled={!!loading}>
                            {loading === 'create' ? <Loader2 className="animate-spin" /> : <Video />}
                            New meeting
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align='start'
                        className="w-fit p-0 z-40"
                    >
                        <div className="grid">
                            <MeetLinkDialog>
                                <Button
                                    disabled={!!loading}
                                    variant="ghost"
                                    className='justify-start'
                                >
                                    <Link2 /> Create a meeting for later
                                </Button>
                            </MeetLinkDialog>
                            <Button
                                disabled={!!loading}
                                variant="ghost"
                                onClick={onCreateRoom}
                                className='justify-start'
                            >
                                <Plus />
                                Start an instant meeting
                            </Button>
                            <Button
                                disabled
                                variant="ghost"
                                className='justify-start'
                            >
                                <Calendar /> Schedule in calendar
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Input
                    value={code}
                    className="w-60 sm:w-[20rem]"
                    placeholder="Enter a code or link"
                    onChange={(e) => setCode(e.target.value)}
                >
                    <InputIcon position="left">
                        <Keyboard className="size-4" />
                    </InputIcon>
                </Input>
                <Button
                    disabled={!code || !!loading}
                    variant="secondary"
                    onClick={onJoinRoom}
                >
                    {loading === 'join' && <Loader2 className="animate-spin" />}
                    Join
                </Button>
            </div>
            <Separator className='mt-4 md:mt-8' />
        </div>
    )
}