'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import * as Icon from 'lucide-react'

import { useRoom } from '@/stores/room'
import { usePeople } from '../use-people'
import { useStream } from '@/stores/stream'
import { useAuthStore } from '@/stores/auth'
import { useControls } from './use-controls'

import { Button } from '@/components/ui/button'
import { VisualEffects } from '@/components/visual-effects-dialog'

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import {
    VideoStream,
    VideoStreamSrouce,
    VideoStreamFallback,
    VideoStreamSharedScreen,
    VideoStreamAudioIndicator,
    VideoStreamOptions
} from '@/components/ui/extends/video-stream'
import {
    DropdownMenuGroup,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu'

export function MainVideoStream({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const room = useRoom()
    const stream = useStream()
    const { user } = useAuthStore()
    const { controls } = useControls()
    const { people, sharedScreen: otherSharedScreen, count, setPeople } = usePeople()

    const isRejected = stream.status === 'rejected';
    const disableCamera = !room.host && !controls.allowVideo;

    const sharedScreenTrack = React.useMemo(() => (
        otherSharedScreen ?? stream.sharedScreen
    ), [stream.sharedScreen, otherSharedScreen])

    return (
        <div
            {...props}
            className={cn(
                'relative flex flex-col sm:flex-row h-[92%] xsm:h-full sm:place-items-center sm:place-content-center gap-2 p-2',
                className
            )}
        >
            {stream.pictureInPicture ? (
                <div className="flex flex-col justify-center items-center size-full md:mx-2 gap-2">
                    <h4 className="text-2xl font-semibold">
                        Your call is in another window
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        Using picture-in-picture lets you stay in the call while you do other things
                    </p>
                </div>
            ) : (
                <>
                    <VideoStreamSharedScreen
                        fullscreen={stream.fullscreen}
                        mediaTrack={sharedScreenTrack}
                        className='relative flex flex-col justify-center items-center min-h-96'
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className='hidden absolute rounded-full bottom-2 right-3 bg-accent/50 size-10 [&_svg]:size-6'
                                    onClick={async () => {
                                        // featrue chrome (beta)
                                        // https://developer.chrome.com/docs/web-platform/captured-surface-control?hl=id
                                    }}
                                >
                                    <Icon.SeparatorHorizontal />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Scroll and zoom you presentation</TooltipContent>
                        </Tooltip>
                    </VideoStreamSharedScreen>

                    <div
                        className={cn(
                            // need fix
                            'grid grid-cols-1 place-content-stretch gap-2 size-full overflow-auto md:mx-2',
                            sharedScreenTrack ? 'basis-[50%] sm:basis-[20%] content-start' : 'place-items-center',
                            {
                                'md:grid-cols-2': count === 2 && !sharedScreenTrack,
                                'lg:grid-cols-3': count >= 3 && !sharedScreenTrack,
                                // 'lg:grid-cols-4': count > 3 && !sharedScreenTrack,
                                'hidden': otherSharedScreen && stream.fullscreen,
                            },
                        )}
                    >
                        {new Array(1).fill(0).map((_, idx) => (
                            <VideoStream
                                key={idx}
                                className={cn(
                                    // need fix
                                    'overflow-hidden rounded-lg h-full min-h-48',
                                    !sharedScreenTrack && 'max-w-5xl max-h-60 md:min-w-[15rem] md:min-h-[25rem] lg:max-h-[35rem]'
                                )}
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
                                <VideoStreamOptions>
                                    <DropdownMenuItem
                                        disabled={disableCamera}
                                        onClick={async () => {
                                            if (isRejected || disableCamera) return;
                                            await stream.toggleCamera((track) => {
                                                Object.values(people).forEach((v) => {
                                                    const peer = v.call?.peerConnection;
                                                    if (peer) {
                                                        peer.getSenders().find((s) =>
                                                            s.track?.kind === track.kind
                                                        )?.replaceTrack(track)
                                                    }
                                                });
                                            });
                                            room.socket.emit('user:toggle-video', {
                                                peerId: room.peerId,
                                                roomId: room.roomId
                                            });
                                        }}
                                    >
                                        {!stream.visible ? <Icon.VideoIcon /> : <Icon.VideoOff />}
                                        Turn {stream.visible ? 'off' : 'on'} camera
                                    </DropdownMenuItem>
                                    <VisualEffects asChild>
                                        <DropdownMenuItem disabled onSelect={(e) => e.preventDefault()}>
                                            <Icon.Sparkles /> Apply visual effects
                                        </DropdownMenuItem>
                                    </VisualEffects>
                                </VideoStreamOptions>
                            </VideoStream>
                        ))}

                        {Object.values(people).map((v, idx) => (
                            <VideoStream
                                key={idx}
                                className={cn(
                                    // need fix
                                    'overflow-hidden rounded-lg h-full min-h-48 max-h-72',
                                    !sharedScreenTrack && 'max-w-5xl xmax-h-60 md:min-w-[15rem] md:min-h-[25rem] lg:max-h-[35rem]'
                                )}
                            >
                                <VideoStreamSrouce
                                    title={v.name}
                                    muted={v.muted}
                                    allowStreamAudio
                                    visibility={v.visible}
                                    media={v.dontWatch ? null : (v?.stream ?? null)}
                                >
                                    <VideoStreamFallback src={v.photo}>
                                        {v.name?.slice(0, 1)}
                                    </VideoStreamFallback>
                                </VideoStreamSrouce>
                                <VideoStreamAudioIndicator
                                    autoHide
                                    muted={v.muted}
                                    media={v?.stream ?? null}
                                    className='absolute bottom-2 left-2'
                                />
                                <VideoStreamOptions>
                                    <DropdownMenuItem disabled>
                                        <Icon.Pin />
                                        Pin to the screen
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={!v.visible}
                                        onClick={() => {
                                            setPeople({ [v.peerId!]: { dontWatch: !v.dontWatch } })
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
                                                            roomId: room.roomId,
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
                                            <DropdownMenuItem disabled={!otherSharedScreen}>
                                                <Icon.ScreenShareOff />
                                                Stop Screen Share
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    room.socket.emit('host:remove-user', {
                                                        roomId: room.roomId,
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
                </>
            )}
        </div>
    )
}