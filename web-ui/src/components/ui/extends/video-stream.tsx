'use client'
import React from 'react'
import { cn, vc } from '@/lib/utils';
import { memo, forwardRef } from 'react'
import { useAudio } from '@/hooks/use-audio';

import { Button } from "@/components/ui/button";

import {
    Volume1,
    Volume2,
    VolumeX,
    EllipsisVertical,
} from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from '../dropdown-menu';

const VideoStream = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            {...props}
            className={cn('relative group w-full max-w-xl', className)} />
    )
)
VideoStream.displayName = "VideoStream"

export interface VideoStreamSrouceProps extends
    React.ComponentProps<'div'> {
    muted?: boolean
    visibility?: boolean
    media: MediaStream | null
    /**
     * allow to stream audio when video track media is empty
     */
    allowStreamAudio?: boolean
}

const VideoStreamSrouce = memo(forwardRef<HTMLVideoElement, VideoStreamSrouceProps>(
    ({ media, muted, visibility, children, title, className, allowStreamAudio, ...props }, ref) => {
        const videoRef = React.useRef<HTMLVideoElement>(null);
        const audioRef = React.useRef<HTMLAudioElement>(null);

        const live = visibility ?? media?.getVideoTracks()[0]?.readyState === "live";
        const fallback = vc<VideoStreamFallbackProps>(children, 'VideoStreamFallback')
        const isAudioMuted = media?.getAudioTracks()[0]?.enabled === false;

        // @ts-expect-error: The expected type comes from the return type of this signature.
        React.useImperativeHandle(ref, () => videoRef.current)

        React.useEffect(() => {
            if (videoRef.current && media && live) {
                videoRef.current.srcObject = media;
            }
        }, [media, live]);

        React.useEffect(() => {
            if (allowStreamAudio && audioRef.current && media) {
                audioRef.current.srcObject = media;
            }
        }, [media, allowStreamAudio]);

        return (
            <div
                {...props}
                className={cn('size-full', className)}
            >
                {(media && live) ? (
                    <video
                        autoPlay
                        playsInline
                        ref={videoRef}
                        muted={allowStreamAudio ?? muted}
                        className="border rounded-xl aspect-video object-cover size-full"
                    />
                ) : fallback?.element}
                {allowStreamAudio && (
                    <audio ref={audioRef} autoPlay playsInline muted={isAudioMuted} />
                )}
                {title && (
                    <p title={title} className="absolute top-3 left-3 hidden group-hover:block text-xs font-medium text-sidebar-foreground max-w-20 truncate">
                        {title}
                    </p>
                )}
            </div>
        )
    }
));
VideoStream.displayName = "VideoStream"

export interface VideoStreamFallbackProps extends
    React.ComponentProps<'img'> {
    src?: string
}

const VideoStreamFallback = forwardRef<HTMLDivElement, VideoStreamFallbackProps>(
    ({ className, alt, src, children, ...props }, ref) => (
        <div
            ref={ref}
            {...props}
            className={cn(
                'relative size-full border rounded-xl aspect-video',
                className
            )}
        >
            <div className="rounded-xl bg-sidebar backdrop-blur-3xl absolute top-0 left-0 size-full" />
            <Avatar className="size-12 xl:size-24 rounded-full absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <AvatarImage src={src} alt={alt} />
                <AvatarFallback className='text-xl md:text-4xl'>
                    {children}
                </AvatarFallback>
            </Avatar>
        </div>
    )
)
VideoStreamFallback.displayName = "VideoStreamFallback"

export interface VideoStreamAudioIndicatorProps extends
    React.ComponentProps<'div'> {
    autoHide?: boolean
    muted?: boolean
    media?: MediaStream | null
}
const VideoStreamAudioIndicator = forwardRef<HTMLDivElement, VideoStreamAudioIndicatorProps>(
    ({ autoHide, muted, media, className, ...props }, ref) => {
        const { isSpeaking, startAnalyzing, stopAnalyzing } = useAudio();
        const isMuted = muted || media?.getAudioTracks()[0]?.enabled === false;
        const Icon = isMuted ? VolumeX : (isSpeaking ? Volume2 : Volume1);

        React.useEffect(() => {
            if (media && !muted) startAnalyzing(media);
            return () => {
                stopAnalyzing();
            };
        }, [media, isMuted]);

        return (
            <>
                <div
                    ref={ref}
                    {...props}
                    className={cn(
                        "inline-flex justify-center items-center bg-muted rounded-full border p-1",
                        (autoHide && !isMuted && !isSpeaking) && "hidden",
                        className
                    )}
                >
                    <Icon className="size-4" />
                </div>
            </>
        );
    }
);
VideoStreamAudioIndicator.displayName = "VideoStreamAudioIndicator";


const VideoStreamControl = forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            {...props}
            className={cn(
                'absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-4',
                className
            )}
        />
    )
)
VideoStreamControl.displayName = "VideoStreamControl"

const VideoStreamControlButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
    ({ title, className, children, ...props }, ref) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        ref={ref}
                        size="icon"
                        className={cn(
                            'dark:border-white rounded-full md:size-12 md:[&_svg]:size-5',
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </Button>
                </TooltipTrigger>
                <TooltipContent hidden={!title}>
                    {title}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider >
    )
)
VideoStreamControlButton.displayName = "VideoStreamControlButton"

export interface VideoStreamOptionsProps
    extends React.ComponentProps<typeof Button> {
    align?: "center" | "end" | "start" | undefined
}

const VideoStreamOptions = forwardRef<HTMLButtonElement, VideoStreamOptionsProps>(
    ({ align, title, className, children, ...props }, ref) => {
        const [open, setOpen] = React.useState(false)
        const [showTooltip, setShowTooltip] = React.useState(false)
        const tooltipTimeout = React.useRef<NodeJS.Timeout | null>(null)

        return (
            <DropdownMenu
                open={open}
                onOpenChange={(isOpen) => {
                    setOpen(isOpen)
                    if (isOpen) {
                        setShowTooltip(false)
                        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current)
                    }
                }}
            >
                <TooltipProvider>
                    <Tooltip open={showTooltip}>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    ref={ref}
                                    {...props}
                                    size="icon"
                                    variant="ghost"
                                    onMouseEnter={() => {
                                        if (!open) {
                                            tooltipTimeout.current = setTimeout(() => {
                                                setShowTooltip(true)
                                            }, 500)
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setShowTooltip(false)
                                        if (tooltipTimeout.current) {
                                            clearTimeout(tooltipTimeout.current)
                                        }
                                    }}
                                    className={cn(
                                        'absolute top-2 right-2 rounded-full transition-opacity duration-200',
                                        'hover:bg-foreground/50 text-white hover:text-white',
                                        open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                                        className
                                    )}
                                >
                                    <EllipsisVertical />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side='bottom'>
                            {title ?? 'More options'}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DropdownMenuContent align={align}>
                    {children}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
)
VideoStreamOptions.displayName = "VideoStreamOptions"

export interface VideoStreamSharedScreenProps extends
    React.ComponentProps<'div'> {
    mediaTrack?: MediaStreamTrack
    fullscreen?: boolean
}

const VideoStreamSharedScreen = memo(forwardRef<HTMLDivElement, VideoStreamSharedScreenProps>(
    ({ className, mediaTrack, fullscreen, children, ...props }, ref) => {
        return mediaTrack ? (
            <div
                ref={ref}
                {...props}
                className={cn(
                    'flex justify-center',
                    fullscreen ? 'basis-[100%]' : 'basis-[83%]',
                    className
                )}
            >
                <video
                    muted
                    autoPlay
                    className="rounded-xl object-contain"
                    ref={(node) => {
                        if (node) {
                            node.srcObject = new MediaStream([mediaTrack]);
                        }
                    }}
                />
                {children}
            </div>
        ) : null
    }
))
VideoStreamSharedScreen.displayName = "VideoStreamSharedScreen"

export {
    VideoStream,
    VideoStreamSrouce,
    VideoStreamFallback,
    VideoStreamControl,
    VideoStreamOptions,
    VideoStreamControlButton,
    VideoStreamSharedScreen,
    VideoStreamAudioIndicator,
}