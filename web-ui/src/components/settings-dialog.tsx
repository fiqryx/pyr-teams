"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useStream } from "@/stores/stream"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { StreamProvider } from "@/components/providers/stream-provider"

import {
    Video,
    Speaker,
    Settings,
    MicIcon,
    Volume2,
    TriangleAlert,
} from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    VideoStream,
    VideoStreamAudioIndicator,
    VideoStreamSrouce
} from "./ui/extends/video-stream"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"

interface SettingsDialogProps extends
    React.ComponentProps<typeof DialogTrigger> {
    tooltip?: boolean
    tooltipSide?: "bottom" | "top" | "right" | "left"
}

const nav = [
    { name: "Audio", icon: Speaker, children: <AudioSetting /> },
    { name: "Video", icon: Video, children: <VideoSetting /> },
    { name: "General", icon: Settings, children: <GeneralSetting /> },
]

export function SettingsDialog({
    tooltip,
    tooltipSide,
    ...props
}: SettingsDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [active, setActive] = React.useState(0)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger {...props} />
                    </TooltipTrigger>
                    <TooltipContent side={tooltipSide} hidden={!tooltip}>
                        Settings
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <DialogDescription className="sr-only">
                    Customize your settings here.
                </DialogDescription>
                <StreamProvider
                    className="md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
                    fallback={<SettingsFallback className="md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]" />}
                >
                    <SidebarProvider open className="items-start">
                        <Sidebar collapsible="none" className="flex w-[--sidebar-width-icon] sm:w-[--sidebar-width]">
                            <SidebarContent>
                                <SidebarGroup>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {nav.map((item, idx) => (
                                                <SidebarMenuItem key={idx}>
                                                    <SidebarMenuButton
                                                        isActive={idx === active}
                                                        onClick={() => setActive(idx)}
                                                    >
                                                        <item.icon />
                                                        <span>{item.name}</span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </SidebarContent>
                        </Sidebar>
                        <main className="flex h-screen sm:h-[480px] flex-1 flex-col overflow-hidden">
                            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                                <div className="flex items-center gap-2 px-4">
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem className="hidden md:block">
                                                <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator className="hidden md:block" />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>{nav[active].name}</BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>
                            </header>
                            {nav[active].children ?? (
                                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="aspect-video max-w-3xl rounded-xl bg-muted/50"
                                        />
                                    ))}
                                </div>
                            )}
                        </main>
                    </SidebarProvider>
                </StreamProvider>
            </DialogContent>
        </Dialog>
    )
}

export function SettingsFallback({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const { media, createStream, set } = useStream()

    return (
        <div
            {...props}
            className={cn(
                'flex flex-col h-screen justify-center items-center gap-4',
                className
            )}
        >
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Do you want people to see and hear you in the meeting?
            </h1>
            <p className="text-sm">
                You can still turn off your microphone and camera anytime in the meeting.
            </p>
            <Button
                className="mt-6"
                onClick={createStream}
            >
                Use microphone and camera
            </Button>
            <Button
                variant="ghost"
                onClick={() => {
                    if (media) {
                        set({ status: 'idle' })
                    } else {
                        set({ muted: true, visible: false, status: 'rejected' })
                    }
                }}
            >
                Continue without microphone and camera
            </Button>
        </div>
    )
}

function AudioSetting() {
    const audioRef = React.useRef<HTMLAudioElement>(null)
    const [isAudioPlaying, setIsAudioPlaying] = React.useState(false)

    const {
        media,
        devices,
        microphone,
        speaker,
        muted,
        status,
        set,
        toggleMic,
        switchMic,
    } = useStream()

    async function switchSpeaker(speaker: string) {
        if (audioRef.current) {
            await audioRef.current.setSinkId(speaker)
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            set({ speaker });
            setIsAudioPlaying(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            <div className="flex flex-col gap-1 pt-6 px-4">
                <label htmlFor="microphone" className="text-xs font-semibold">
                    Microphone
                </label>
                <div className="flex items-center gap-6">
                    <Select
                        value={microphone}
                        disabled={status === 'rejected'}
                        onValueChange={switchMic}
                    >
                        <SelectTrigger id="microphone" className="justify-start gap-2 w-48 lg:w-72 [&_svg]:size-4 [&_svg]:shrink-0">
                            <MicIcon className="size-4" />
                            <SelectValue placeholder="Permission needed" />
                        </SelectTrigger>
                        <SelectContent>
                            {devices.map((device) => device.deviceId && device.kind === "audioinput" && (
                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Microphone ${device.deviceId}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <VideoStreamAudioIndicator
                        media={media}
                        muted={muted}
                        onClick={() => toggleMic()}
                        className={cn('cursor-pointer', muted && 'bg-destructive border-0')}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1 pt-6 px-4">
                <label htmlFor="speaker" className="text-xs font-semibold">
                    Speaker
                </label>
                <div className="flex items-center gap-6">
                    <Select
                        value={speaker}
                        disabled={status === 'rejected'}
                        onValueChange={switchSpeaker}
                    >
                        <SelectTrigger id="speaker" className="justify-start gap-2 w-48 lg:w-72 [&_svg]:size-4 [&_svg]:shrink-0">
                            <Volume2 />
                            <SelectValue placeholder="Permission needed" />
                        </SelectTrigger>
                        <SelectContent>
                            {devices.map((device) => device.deviceId && device.kind === "audiooutput" && (
                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                    {device.label || `speaker ${device.deviceId}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            if (audioRef.current) {
                                setIsAudioPlaying(true);
                                audioRef.current.play();
                                audioRef.current.onended = () => setIsAudioPlaying(false)
                            }
                        }}
                    >
                        {isAudioPlaying ? 'Playing' : 'Test'}
                    </Button>
                    <audio ref={audioRef} src="/assets/audio/speaker-test.mp3" />
                </div>
            </div>
        </div>
    )
}

function VideoSetting() {
    const { media, devices, camera, status, switchCamera } = useStream()

    return (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            <div className="flex flex-col gap-1 pt-6 px-4">
                <label htmlFor="camera" className="text-xs font-semibold">
                    Camera
                </label>
                <div className="flex flex-col md:flex-row gap-6">
                    <Select
                        value={camera}
                        disabled={status === 'rejected'}
                        onValueChange={switchCamera}
                    >
                        <SelectTrigger id="camera" className="justify-start gap-2 w-48 lg:w-72 [&_svg]:size-4 [&_svg]:shrink-0">
                            <Volume2 />
                            <SelectValue placeholder="Permission needed" />
                        </SelectTrigger>
                        <SelectContent>
                            {devices.map((device) => device.deviceId && device.kind === "videoinput" && (
                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                    {device.label || `camera ${device.deviceId}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <VideoStream className="border w-40 h-24 rounded-xl">
                        <VideoStreamSrouce media={media} />
                    </VideoStream>
                </div>
            </div>
        </div>
    )
}

function GeneralSetting() {
    const { setTheme, resolvedTheme } = useTheme();
    const [isNotificationEnabled, setNotificationEnabled] = React.useState(false)
    const [isNotificationRejected, setIsNotificationRejected] = React.useState(false)

    const actions = React.useMemo(() => [
        {
            title: 'Dark mode',
            description: 'Reduce eye strain and improve visibility in low-light environments with our dark mode feature.',
            checked: resolvedTheme === 'dark',
            onClick: () => {
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
        },
        {
            title: 'Desktop notifications',
            description: 'Enable desktop notifications to receive real-time alerts for incoming calls and important actions in Meet.',
            checked: isNotificationEnabled,
            onClick: () => toggleNotification,
            alert: isNotificationRejected && 'Please enable notifications in your browser settings to see desktop alerts.'
        },
    ], [resolvedTheme, isNotificationEnabled, isNotificationRejected])

    async function toggleNotification() {
        if (!isNotificationEnabled) {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                setNotificationEnabled(true);
            } else {
                setIsNotificationRejected(true);
            }
        } else {
            setNotificationEnabled(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
            {actions.map((item, idx) => (
                <div key={idx} className="flex items-center pt-6 px-4 gap-4">
                    <div className="flex flex-1 flex-col gap-2">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {item.description}
                        </p>
                    </div>
                    <Switch checked={item.checked} onCheckedChange={item.onClick} />
                    {item.alert && (
                        <div role="alert" className="inline-flex items-center border px-4 py-3 text-sm rounded-lg gap-2 [&_svg]:size-4 [&_svg]:shrink-0">
                            <TriangleAlert className="size-4" />
                            <p className="text-xs leading-relaxed">
                                {item.alert}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
