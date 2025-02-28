'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { toast } from "sonner";
import * as Icon from 'lucide-react'
import { SidebarType } from '@/types/misc'

import { useRoom } from '@/stores/room'
import { useStream } from '@/stores/stream'
import { usePeople } from '../use-people'
import { useControls } from './use-controls';
import { useReaction } from '@/components/reaction';

import { Leave } from './leave'
import { PopupTeams } from './main-popup';
import { Button } from '@/components/ui/button'
import { ControlSidebar } from './main-control-sidebar'
import { SettingsDialog } from '@/components/settings-dialog'
import { VisualEffects } from '@/components/visual-effects-dialog'
import { VideoStreamControlButton } from '@/components/ui/extends/video-stream'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ActionsControlProps extends
    React.ComponentProps<'div'> {
    open: boolean
    onOpenChange: (type: SidebarType) => void
}

const reactions = ['💖', '👍', '🎉', '👏', '😂', '😯', '😥', '🤔', '👎']

export function MainControl({
    className,
    onOpenChange,
    ...props
}: ActionsControlProps) {
    const people = usePeople()
    const stream = useStream()

    const { controls } = useControls()
    const { showReaction } = useReaction()
    const { socket, roomId, peerId, ...room } = useRoom()

    const [date, setDate] = React.useState(new Date())
    const [optionShareScreen, setOptionShareScreen] = React.useState(false)
    const [openDialogShareScreen, setOpenDialogShareScreen] = React.useState(false)

    const isRejected = stream.status === 'rejected';
    const microphoneActive = !stream.muted && !isRejected;
    const cameraActive = stream.visible && !isRejected;

    const disableMicrophone = !room.host && !controls.allowMicrophone;
    const disableCamera = !room.host && !controls.allowVideo;
    const disableShareScreen = !room.host && !controls.allowShareScreen;
    const disableReaction = !room.host && !controls.allowReaction;
    const disableChat = !room.host && !controls.allowSendChat;

    const onStartShareScreen = async () => {
        setOptionShareScreen(false)
        setOpenDialogShareScreen(false)
        return await stream.startShareScreen({
            onStart: () => {
                people.setSharedScreen(undefined)
                socket.emit('user:share-screen', { peerId, roomId });
                setTimeout(() => window.focus(), 1000)
            },
            onEnded: () => {
                socket.emit('user:stop-share-screen', { peerId, roomId })
            },
        })
    }

    React.useEffect(() => {
        const interval = setInterval(() => setDate(new Date()), 1000);
        document.addEventListener("fullscreenchange", () =>
            stream.set({ fullscreen: !!document.fullscreenElement })
        )

        return () => {
            clearInterval(interval)
            document.removeEventListener("fullscreenchange", () =>
                stream.set({ fullscreen: !!document.fullscreenElement })
            )
        }
    }, [])

    return (
        <div
            {...props}
            className={cn(
                'fixed bottom-0 w-full flex justify-center items-center bg-sidebar border-t gap-2 p-2',
                className
            )}
        >
            <PopupTeams className='ml-2 relative -top-20 hidden lg:block ' />

            <div className="flex justify-center items-center gap-1">
                {/* toogle microphone */}
                <VideoStreamControlButton
                    disabled={disableMicrophone}
                    variant={microphoneActive && !disableMicrophone ? 'secondary' : 'destructive'}
                    title={
                        disableMicrophone ? 'Disable by host' :
                            isRejected ? 'Show more info' : `Turn ${stream.muted ? 'on' : 'off'} microphone`
                    }
                    onClick={() => {
                        if (isRejected || disableMicrophone) return;
                        stream.toggleMic();
                        socket.emit('user:toggle-audio', { peerId, roomId })
                    }}
                >
                    {(microphoneActive && !disableMicrophone) ? <Icon.Mic /> : <Icon.MicOff />}
                </VideoStreamControlButton>

                {/* toggle camera */}
                <VideoStreamControlButton
                    disabled={disableCamera}
                    variant={cameraActive && !disableCamera ? 'secondary' : 'destructive'}
                    title={isRejected ? 'Show more info' : `Turn ${!stream.visible ? 'on' : 'off'} camera`}
                    onClick={async () => {
                        if (isRejected || disableCamera) return;
                        await stream.toggleCamera((track) => {
                            Object.values(people.people).forEach((v) => {
                                const peer = v.call?.peerConnection;
                                if (peer) {
                                    peer.getSenders().find((s) =>
                                        s.track?.kind === track.kind
                                    )?.replaceTrack(track)
                                }
                            });
                        });
                        socket.emit('user:toggle-video', { peerId, roomId });
                    }}
                >
                    {cameraActive && !disableCamera ? <Icon.VideoIcon /> : <Icon.VideoOff />}
                </VideoStreamControlButton>

                {/* reaction */}
                <Popover>
                    <PopoverTrigger asChild>
                        <VideoStreamControlButton
                            variant="secondary"
                            title="Send a reaction"
                            disabled={disableReaction}
                        >
                            <Icon.Laugh />
                        </VideoStreamControlButton>
                    </PopoverTrigger>
                    <PopoverContent className='flex justify-around p-1 rounded-full w-fit'>
                        {reactions.map((reaction, idx) => (
                            <Button
                                key={idx}
                                size="icon"
                                variant="ghost"
                                disabled={disableReaction}
                                onClick={() => {
                                    if (disableReaction) return
                                    showReaction(reaction)
                                    socket.emit('user:reaction', { roomId, peerId, reaction })
                                }}
                                className='text-2xl rounded-full'
                            >
                                {reaction}
                            </Button>
                        ))}
                    </PopoverContent>
                </Popover>

                {/* share screen */}
                <Dialog open={openDialogShareScreen}>
                    <DropdownMenu
                        open={optionShareScreen}
                        onOpenChange={(open) => {
                            if (!stream.sharedScreen) {
                                setOptionShareScreen(false)
                            } else {
                                setOptionShareScreen(open)
                            }
                        }}
                    >
                        <DropdownMenuTrigger asChild>
                            <DialogTrigger asChild>
                                <VideoStreamControlButton
                                    disabled={disableShareScreen}
                                    variant={stream.sharedScreen ? 'default' : 'secondary'}
                                    title={stream.sharedScreen ? 'Stop share screen' : 'Share your screen'}
                                    onClick={async () => {
                                        if (disableShareScreen) return
                                        if (stream.sharedScreen) {
                                            setOptionShareScreen(!optionShareScreen)
                                        } else if (people.sharedScreen) {
                                            setOpenDialogShareScreen(true)
                                        } else if (await onStartShareScreen()) {
                                            toast('Starting presenting screen')
                                        }
                                    }}
                                >
                                    {stream.sharedScreen ? <Icon.ScreenShareOff /> : <Icon.ScreenShare />}
                                </VideoStreamControlButton>
                            </DialogTrigger>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={onStartShareScreen}>
                                    <Icon.MonitorUp /> Present something else
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (stream.sharedScreen) {
                                            stream.stopShareScreen();
                                            socket.emit('user:stop-share-screen', { peerId, roomId });
                                            toast('Presenting screen has been stopped');
                                            setOptionShareScreen(false)
                                        }
                                    }}
                                >
                                    <Icon.ScreenShareOff /> Stop presenting
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent hidePrimitiveClose className="sm:max-w-sm p-0">
                        <DialogHeader className='p-4'>
                            <DialogTitle className='sr-only' />
                            <DialogDescription className='text-md'>
                                This will allow you take over from the main presenter
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className='mt-2 p-2'>
                            <Button
                                variant="ghost"
                                onClick={() => setOpenDialogShareScreen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="ghost"
                                disabled={disableShareScreen}
                                onClick={onStartShareScreen}
                            >
                                Share now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* chat (mobile) */}
                <VideoStreamControlButton
                    variant="secondary"
                    disabled={disableChat}
                    title="Chat with everyone"
                    className='flex lg:hidden'
                    onClick={() => onOpenChange('chat')}
                >
                    <Icon.MessageSquareText />
                </VideoStreamControlButton>

                {/* more options */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="block">
                            <VideoStreamControlButton
                                variant="secondary"
                                title="More options"
                                className='px-1'
                            >
                                <Icon.EllipsisVertical />
                            </VideoStreamControlButton>
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem disabled>
                                <Icon.Cast /> Cast this meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                <Icon.Disc /> Record this meeting
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem disabled>
                                <Icon.LayoutDashboard /> Change layout
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (!document.fullscreenElement) {
                                        document.documentElement.requestFullscreen();
                                        stream.set({ fullscreen: true });
                                    } else {
                                        document.exitFullscreen();
                                        stream.set({ fullscreen: false });
                                    }
                                }}
                            >
                                <Icon.Fullscreen /> {!stream.fullscreen ? 'Fullscreen' : 'Exit fullscreen'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={stream.pictureInPicture}
                                onClick={() => {
                                    stream.set({ pictureInPicture: true })
                                }}
                            >
                                <Icon.PictureInPictureIcon />
                                Open picture-in-picture
                            </DropdownMenuItem>
                            <VisualEffects asChild>
                                <DropdownMenuItem disabled onSelect={(e) => e.preventDefault()}>
                                    <Icon.Sparkles /> Apply visual effects
                                </DropdownMenuItem>
                            </VisualEffects>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className='block lg:hidden' />

                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => onOpenChange('people')}
                                className='flex lg:hidden'
                            >
                                <Icon.Users /> People
                            </DropdownMenuItem>
                            {room.host && (
                                <DropdownMenuItem
                                    className='flex lg:hidden'
                                    onClick={() => onOpenChange('host')}
                                >
                                    <Icon.LockKeyhole /> Host controls
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem disabled>
                                <Icon.MessageSquareWarning /> Report a problem
                            </DropdownMenuItem>
                            <SettingsDialog asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Icon.Settings /> Settings
                                </DropdownMenuItem>
                            </SettingsDialog>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* end call */}
                <Leave asChild hidePrimitiveClose>
                    <VideoStreamControlButton
                        title="Leave call"
                        variant="destructive"
                        className='bg-red-500 hover:bg-red-500/80 ml-2 px-10'
                    >
                        <Icon.PhoneOff />
                    </VideoStreamControlButton>
                </Leave>
            </div>

            <div className="absolute left-5 bottom-4 hidden lg:flex gap-2">
                <span>
                    {date.toLocaleString("en", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    })}
                </span>
                <span> | </span>
                <span>{roomId}</span>
            </div>

            <ControlSidebar
                onOpenChange={onOpenChange}
                className={cn(
                    'absolute right-5 bottom-2',
                )}
            />
        </div>
    )
}