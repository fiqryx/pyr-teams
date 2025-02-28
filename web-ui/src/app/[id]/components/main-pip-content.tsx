'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import * as Icon from 'lucide-react'

import { useRoom } from '@/stores/room'
import { usePeople } from '../use-people'
import { useStream } from '@/stores/stream'
import { useAuthStore } from '@/stores/auth'
import { useControls } from './use-controls'
import { useReaction } from '@/components/reaction'

import { Button } from '@/components/ui/button'
import { SettingsDialog } from '@/components/settings-dialog'
import { VisualEffects } from '@/components/visual-effects-dialog'

import {
    VideoStream,
    VideoStreamSrouce,
    VideoStreamFallback,
    VideoStreamSharedScreen,
    VideoStreamControlButton,
    VideoStreamAudioIndicator,
    VideoStreamOptions,
} from '@/components/ui/extends/video-stream'
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    DropdownNative,
    DropdownNativeContent,
    DropdownNativeItem,
    DropdownNativeTrigger
} from '@/components/ui/extends/dropdown-native'

const reactions = ['💖', '👍', '🎉', '👏', '😂', '😯', '😥', '🤔', '👎']

export function PictureInPictureContent() {
    const people = usePeople()
    const stream = useStream()
    const { user } = useAuthStore()

    const { controls } = useControls()
    const { showReaction } = useReaction()
    const { roomId, peerId, ...room } = useRoom()

    const isRejected = stream.status === 'rejected';
    const microphoneActive = !stream.muted && !isRejected;
    const cameraActive = stream.visible && !isRejected;

    const disableMicrophone = !room.host && !controls.allowMicrophone;
    const disableCamera = !room.host && !controls.allowVideo;
    const disableReaction = !room.host && !controls.allowReaction;
    const disableChat = !room.host && !controls.allowSendChat;

    const sharedScreenTrack = React.useMemo(() => (
        people.sharedScreen ?? stream.sharedScreen
    ), [stream.sharedScreen, people.sharedScreen])

    return (
        <div className='flex flex-col h-screen'>
            <div className="flex flex-col h-full overflow-auto sm:place-items-center sm:place-content-center gap-2 p-2">
                <VideoStreamSharedScreen
                    fullscreen={stream.fullscreen}
                    mediaTrack={sharedScreenTrack}
                    className='max-w-xl max-h-60'
                />

                <div
                    className={cn(
                        'grid place-content-stretch place-items-center size-full overflow-auto gap-2',
                        sharedScreenTrack && 'basis-[80%]',
                    )}
                >
                    <VideoStream
                        className={cn('overflow-hidden rounded-lg h-full min-h-40', {
                            'md:min-h-[25rem] max-h-48 lg:max-h-[35rem]': !sharedScreenTrack
                        })}
                    >
                        <VideoStreamSrouce muted media={stream.media} title="You">
                            <VideoStreamFallback src={user?.photo}>
                                {user?.name.slice(0, 1)}
                            </VideoStreamFallback>
                        </VideoStreamSrouce>

                        <VideoStreamAudioIndicator
                            autoHide
                            muted={stream.muted}
                            media={stream.media}
                            className='absolute bottom-2 left-2'
                        />

                        <VideoStreamOptions className='hidden'>
                            <DropdownMenuItem
                                disabled={disableCamera}
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
                                    room.socket.emit('user:toggle-video', { peerId, roomId });
                                }}
                            >
                                {!stream.visible ? <Icon.VideoIcon /> : <Icon.VideoOff />}
                                Turn {stream.visible ? 'off' : 'on'} camera
                            </DropdownMenuItem>
                            <VisualEffects asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Icon.Sparkles /> Apply visual effects
                                </DropdownMenuItem>
                            </VisualEffects>
                        </VideoStreamOptions>
                    </VideoStream>

                    {Object.values(people.people).map((v, idx) => (
                        <VideoStream
                            key={idx}
                            className={cn('overflow-hidden rounded-lg h-full min-h-40', {
                                'md:min-h-[25rem] max-h-48 lg:max-h-[35rem]': !sharedScreenTrack
                            })}
                        >
                            <VideoStreamSrouce
                                title={v.name}
                                muted={v.muted}
                                visibility={v.visible}
                                media={v.dontWatch ? null : (v?.stream ?? null)}
                            >
                                <VideoStreamFallback src={v?.photo}>
                                    {v.name?.slice(0, 1)}
                                </VideoStreamFallback>
                            </VideoStreamSrouce>

                            <VideoStreamAudioIndicator
                                autoHide
                                muted={v.muted}
                                media={v?.stream ?? null}
                                className='absolute bottom-2 left-2'
                            />

                            <VideoStreamOptions className='hidden'>
                                <DropdownMenuItem disabled>
                                    <Icon.Pin />
                                    Pin to the screen
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={!v.visible}
                                    onClick={() => {
                                        people.setPeople({ [v.peerId!]: { dontWatch: !v.dontWatch } })
                                    }}
                                >
                                    {v.dontWatch ? <Icon.Video /> : <Icon.VideoOff />}
                                    {v.dontWatch ? 'Watch' : "Don't watch"}
                                </DropdownMenuItem>
                                {room.host && (
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            disabled={v.muted || !room.host}
                                            onClick={() => {
                                                if (room.host && !v.muted) {
                                                    room.socket.emit('host:mute-user', {
                                                        roomId,
                                                        peerId: v.peerId
                                                    })
                                                }
                                            }}
                                        >
                                            {v.muted ? <Icon.MicOff /> : <Icon.Mic />}
                                            {v.muted ? 'Unmuted' : 'Muted'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem disabled>
                                            <Icon.UserCog />
                                            Assign as Host
                                        </DropdownMenuItem>
                                        <DropdownMenuItem disabled={!people.sharedScreen}>
                                            <Icon.ScreenShareOff />
                                            Stop Screen Share
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                room.socket.emit('host:remove-user', {
                                                    roomId,
                                                    peerId: v.peerId
                                                })
                                            }}
                                        >
                                            <Icon.UserX />
                                            Remove from Meeting
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                )}
                            </VideoStreamOptions>
                        </VideoStream>
                    ))}
                </div>
            </div>

            <div className="w-full flex justify-center items-center bg-sidebar border-t gap-1 p-2">
                {/* toggle microphone */}
                <VideoStreamControlButton
                    disabled={disableMicrophone}
                    variant={microphoneActive && !disableMicrophone ? 'secondary' : 'destructive'}
                    onClick={() => {
                        if (isRejected || disableMicrophone) return;
                        stream.toggleMic();
                        room.socket.emit('user:toggle-audio', { roomId, peerId })
                    }}
                >
                    {(microphoneActive && !disableMicrophone) ? <Icon.Mic /> : <Icon.MicOff />}
                </VideoStreamControlButton>

                {/* toggle camera */}
                <VideoStreamControlButton
                    disabled={disableCamera}
                    variant={cameraActive && !disableCamera ? 'secondary' : 'destructive'}
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
                        room.socket.emit('user:toggle-video', { roomId, peerId });
                    }}
                >
                    {cameraActive && !disableCamera ? <Icon.VideoIcon /> : <Icon.VideoOff />}
                </VideoStreamControlButton>

                {/* reactions*/}
                <DropdownNative>
                    <DropdownNativeTrigger asChild>
                        <VideoStreamControlButton variant="secondary" disabled={disableReaction}>
                            <Icon.Laugh />
                        </VideoStreamControlButton>
                    </DropdownNativeTrigger>
                    <DropdownNativeContent side="top-center" className='left-full flex justify-around p-1 rounded-full w-fit gap-1'>
                        {reactions.map((reaction, idx) => (
                            <Button
                                key={idx}
                                size="icon"
                                variant="ghost"
                                disabled={disableReaction}
                                onClick={() => {
                                    if (disableReaction) return
                                    showReaction(reaction)
                                    room.socket.emit('user:reaction', { roomId, peerId, reaction })
                                }}
                                className='size-6 text-xl rounded-full'
                            >
                                {reaction}
                            </Button>
                        ))}
                    </DropdownNativeContent>
                </DropdownNative>

                {/* chat */}
                <VideoStreamControlButton
                    variant="secondary"
                    disabled={disableChat}
                >
                    <Icon.MessageSquareText />
                </VideoStreamControlButton>

                {/* more options */}
                <DropdownNative>
                    <DropdownNativeTrigger asChild>
                        <VideoStreamControlButton variant="secondary" className='px-1'>
                            <Icon.EllipsisVertical />
                        </VideoStreamControlButton>
                    </DropdownNativeTrigger>
                    <DropdownNativeContent side="top-center">
                        <DropdownNativeItem disabled className='text-xs'>
                            <Icon.Cast /> Cast this meeting
                        </DropdownNativeItem>
                        <DropdownNativeItem disabled className='text-xs'>
                            <Icon.Disc /> Record this meeting
                        </DropdownNativeItem>

                        <DropdownMenuSeparator />

                        <DropdownNativeItem disabled className='text-xs'>
                            <Icon.LayoutDashboard /> Change layout
                        </DropdownNativeItem>
                        <VisualEffects asChild>
                            <DropdownNativeItem disabled className='text-xs'>
                                <Icon.Sparkles /> Apply visual effects
                            </DropdownNativeItem>
                        </VisualEffects>

                        <DropdownMenuSeparator />

                        <DropdownNativeItem disabled className='text-xs'>
                            <Icon.Users /> People
                        </DropdownNativeItem>
                        <DropdownNativeItem disabled className='text-xs'>
                            <Icon.LockKeyhole /> Host controls
                        </DropdownNativeItem>

                        <DropdownMenuSeparator />

                        <DropdownNativeItem disabled className='text-xs'>
                            <Icon.MessageSquareWarning /> Report a problem
                        </DropdownNativeItem>
                        <SettingsDialog asChild>
                            <DropdownNativeItem disabled className='text-xs'>
                                <Icon.Settings /> Settings
                            </DropdownNativeItem>
                        </SettingsDialog>
                    </DropdownNativeContent>
                </DropdownNative>

                {/* end call */}
                <VideoStreamControlButton
                    variant="destructive"
                    onClick={() => {
                        stream.set({ pictureInPicture: false })
                        room.setRoom({ leave: true })
                    }}
                    className='bg-red-500 hover:bg-red-500/80 ml-2 px-10'
                >
                    <Icon.PhoneOff />
                </VideoStreamControlButton>
            </div>
        </div>
    )
}