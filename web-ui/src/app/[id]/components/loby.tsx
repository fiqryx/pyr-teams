'use client'
import React from 'react'
import { cn } from '@/lib/utils'

import { useRoom } from '@/stores/room'
import { usePeople } from '../use-people'
import { useStream } from '@/stores/stream'
import { useAuthStore } from '@/stores/auth'
import { useControls } from './use-controls'

import { Button } from '@/components/ui/button'
import { SettingsDialog } from '@/components/settings-dialog'
import { VisualEffects } from '@/components/visual-effects-dialog'

import {
    Mic,
    MicOff,
    Sparkles,
    VideoOff,
    Settings,
    VideoIcon,
    ChevronDown,
    MessageSquareWarning,
    Volume2,
    Loader2,
    LockKeyhole,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    VideoStream,
    VideoStreamSrouce,
    VideoStreamFallback,
    VideoStreamControl,
    VideoStreamOptions,
    VideoStreamControlButton,
    VideoStreamAudioIndicator,
} from '@/components/ui/extends/video-stream'
import {
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

interface Props extends
    React.ComponentProps<'div'> {
    onJoin?: () => void
}

export function Lobby({
    onJoin,
    className,
    ...props
}: Props) {
    const { user } = useAuthStore()
    const { count } = usePeople()
    const { controls } = useControls()
    const { host, accept, ...room } = useRoom()

    const audioRef = React.useRef<HTMLAudioElement>(null)
    const [waiting, setWaiting] = React.useState(false)
    const isWaiting = waiting && !accept;

    const {
        media,
        status,
        muted,
        visible,
        devices,
        speaker,
        camera,
        microphone,
        set,
        toggleMic,
        switchMic,
        toggleCamera,
        switchCamera,
    } = useStream()

    const toggleDevices = React.useMemo(() => {
        const rejected = status === 'rejected';
        return [
            {
                active: !muted && !rejected,
                onClick: () => toggleMic(),
                icons: { active: <Mic />, inactive: <MicOff /> },
                title: rejected ? 'Show more info' : `Turn ${muted ? 'on' : 'off'} microphone`,
            },
            {
                active: visible && !rejected,
                onClick: () => toggleCamera(),
                icons: { active: <VideoIcon />, inactive: <VideoOff /> },
                title: rejected ? 'Show more info' : `Turn ${!visible ? 'on' : 'off'} camera`,
            },
        ]
    }, [muted, visible, status])

    const controlDevices = React.useMemo(() => [
        {
            id: 'microphone',
            label: 'Microphone',
            kind: 'audioinput',
            icon: Mic,
            value: microphone,
            onChange: switchMic
        },
        {
            id: 'speaker',
            label: 'Speaker',
            kind: 'audiooutput',
            icon: Volume2,
            value: speaker,
            onChange: switchSpeaker
        },
        {
            id: 'camera',
            label: 'Camera',
            kind: 'videoinput',
            icon: VideoIcon,
            value: camera,
            onChange: switchCamera
        },
    ], [devices, microphone, speaker, camera, muted])

    async function switchSpeaker(speaker: string) {
        if (audioRef.current) {
            await audioRef.current.setSinkId(speaker)
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            set({ speaker });
        }
    }

    React.useEffect(() => {
        if (!waiting) return;

        if (room.status === 'disconnected') {
            setWaiting(false);
            room.setRoom({ status: 'idle' });
            return;
        }

        const timeout = setTimeout(() => {
            if (room.status === 'loading') {
                setWaiting(false);
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [waiting, room.status])

    return (
        <div
            {...props}
            className={cn(
                'container mx-auto max-w-7xl grid lg:grid-cols-2 min-h-screen place-content-center lg:place-items-center gap-8 p-4',
                className
            )}
        >
            <div className="flex flex-col gap-2">
                <VideoStream className='w-[calc(100svw-2rem)] md:max-w-xl'>
                    <VideoStreamSrouce muted title="You" media={media} allowStreamAudio>
                        <VideoStreamFallback src={user?.photo}>
                            {user?.name.slice(0, 2)}
                        </VideoStreamFallback>
                    </VideoStreamSrouce>
                    <VideoStreamAudioIndicator
                        autoHide
                        media={media}
                        muted={muted}
                        className='absolute bottom-2 left-2'
                    />
                    <VideoStreamControl>
                        {toggleDevices.map(({ active, onClick, icons, title }, idx) => (
                            <VideoStreamControlButton
                                key={idx}
                                title={title}
                                onClick={onClick}
                                className={cn(
                                    active ? 'bg-transparent' : 'dark:border-none',
                                    visible && active ? 'border-white text-white' : ''
                                )}
                                variant={active ? 'outline' : 'destructive'}
                            >
                                {active ? icons.active : icons.inactive}
                            </VideoStreamControlButton>
                        ))}
                    </VideoStreamControl>
                    <VisualEffects asChild tooltip>
                        <div className='absolute bottom-2 right-2'>
                            <Button
                                size="icon"
                                variant="outline"
                                className={cn(
                                    'bg-transparent rounded-full md:size-12 md:[&_svg]:size-5',
                                    visible ? 'border-white text-white' : 'dark:border-white'
                                )}
                            >
                                <Sparkles />
                            </Button>
                        </div>
                    </VisualEffects>
                    <VideoStreamOptions>
                        <VisualEffects asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Sparkles /> Apply visual effects
                            </DropdownMenuItem>
                        </VisualEffects>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <MessageSquareWarning /> Report a problem
                        </DropdownMenuItem>
                        <SettingsDialog asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Settings /> Settings
                            </DropdownMenuItem>
                        </SettingsDialog>
                    </VideoStreamOptions>
                </VideoStream>
                <div className='hidden md:flex flex-wrap gap-2'>
                    {controlDevices.map((item, idx) => (
                        <Select
                            key={idx}
                            value={item.value}
                            onValueChange={item.onChange}
                            disabled={status === 'rejected'}
                        >
                            <SelectTrigger id={item.id} className="justify-start gap-2 w-44 [&_svg]:size-4 [&_svg]:shrink-0">
                                <item.icon />
                                <SelectValue placeholder="Permission needed" />
                            </SelectTrigger>
                            <SelectContent className="max-w-xs">
                                {devices.map((device) => device.deviceId && device.kind === item.kind && (
                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                        {device.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}
                    <audio ref={audioRef} src="/assets/audio/speaker-test.mp3" />
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <h1 className='text-3xl font-semibold tracking-tight'>
                    Ready to  {host && !count ? 'start?' : 'join?'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {count ? `${count} participant${count > 1 ? "s" : ""} in the room` : 'No one else in here'}
                </p>
                <Button
                    size="lg"
                    disabled={isWaiting}
                    onClick={() => {
                        setWaiting(true)
                        if (onJoin) onJoin()
                    }}
                    className='w-full max-w-[16rem]'
                >
                    {isWaiting && <Loader2 className="animate-spin" />}
                    {(host || controls.access === 'open') ? 'Join now' : (!isWaiting ? 'Ask to join' : 'Waiting someone lets you in')}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isWaiting}
                >
                    Other ways to join <ChevronDown className='size-4' />
                </Button>
                {host && (
                    <div className="inline-flex items-center gap-1">
                        <LockKeyhole className='size-3.5' />
                        <span className="text-xs text-muted-foreground">
                            Host
                        </span>
                    </div>
                )}
            </div>
        </div >
    )
}