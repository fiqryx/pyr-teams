'use client'
import React from "react"

import { useRoom } from "@/stores/room"
import { useControls } from "../use-controls"

import { Access } from "@/types/control"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import {
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group"
import {
    SidebarContent,
    SidebarMenu,
    SidebarGroup,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton
} from "@/components/ui/sidebar"

export function HostControls() {
    const { roomId, ...room } = useRoom()
    const { controls } = useControls()

    const onControlChange = <K extends keyof typeof controls>(
        key: K,
        value: typeof controls[K]
    ) => {
        if (room.host) {
            const control = { ...controls, [key]: value }
            room.socket.emit('host:change-control', { roomId, control })
        }
    }

    const actions = React.useMemo(() => [
        {
            id: 'manage-share-screen',
            label: 'Share thier screen',
            checked: controls.allowShareScreen,
            onCheckedChange: (value: boolean) => {
                onControlChange('allowShareScreen', value)
            },
        },
        {
            id: 'manage-chat',
            label: 'Send chat messages',
            checked: controls.allowSendChat,
            onCheckedChange: (value: boolean) => {
                onControlChange('allowSendChat', value)
            },
        },
        {
            id: 'manage-reactions',
            label: 'Send reactions',
            checked: controls.allowReaction,
            onCheckedChange: (value: boolean) => {
                onControlChange('allowReaction', value)
            },
        },
        {
            id: 'manage-microphone',
            label: 'Turn on thier microphone',
            description: 'Turning this off may not allow people to use the microphone except the host',
            checked: controls.allowMicrophone,
            onCheckedChange: (value: boolean) => {
                onControlChange('allowMicrophone', value)
            },
        },
        {
            id: 'manage-video',
            label: 'Turn on thier video',
            description: 'Turning this off may not allow people to use the camera except the host',
            checked: controls.allowVideo,
            onCheckedChange: (value: boolean) => {
                onControlChange('allowVideo', value)
            },
        },
    ], [controls])

    return room.host ? (
        <SidebarContent className="flex flex-col gap-5">
            <p className="text-sm text-muted-foreground px-4 mt-3">
                Use these host settings to keep control of your teams. Only hosts have access to these controls.
            </p>
            <SidebarGroup className="p-0">
                <SidebarMenu className="mb-4">
                    <h4 className="border-y text-sm font-semibold text-muted-foreground leading-none tracking-tight px-4 py-5">
                        Teams moderation
                    </h4>
                    <SidebarMenuItem className="px-2 mt-2">
                        <SidebarMenuButton asChild className="h-fit items-start hover:bg-sidebar active:bg-sidebar gap-0">
                            <div className="flex justify-between">
                                <div className="space-y-1">
                                    <Label htmlFor="host-management" className="font-semibold">
                                        Host management
                                    </Label>
                                    <p className="text-xs text-muted-foreground leading-none mr-2">
                                        Let's you restrict what contributors can do in the teams
                                    </p>
                                </div>
                                <Switch
                                    id="host-management"
                                    checked={controls.hostManagement}
                                    onCheckedChange={
                                        (value) => onControlChange('hostManagement', value)
                                    }
                                />
                            </div>
                        </SidebarMenuButton>
                        <SidebarMenuSub className="border-none ml-1 mr-0 pr-0">
                            <SidebarMenuSubItem className="p-2 mt-2">
                                <h6 className="text-sm font-semibold text-muted-foreground leading-none tracking-tight">
                                    Let contributors
                                </h6>
                            </SidebarMenuSubItem>
                            {actions.map((item, idx) => (
                                <SidebarMenuSubItem key={idx} className="py-3">
                                    <SidebarMenuSubButton asChild className="h-fit items-start hover:bg-sidebar active:bg-sidebar gap-0">
                                        <div className="flex justify-between">
                                            <div className="space-y-1">
                                                <Label htmlFor={item.id} className="font-semibold">
                                                    {item.label}
                                                </Label>
                                                <p className="text-xs text-muted-foreground leading-none mr-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <Switch
                                                id={item.id}
                                                checked={item.checked}
                                                disabled={!controls.hostManagement}
                                                onCheckedChange={item.onCheckedChange}
                                            />
                                        </div>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu className="mb-4">
                    <h4 className="border-y text-sm font-semibold text-muted-foreground leading-none tracking-tight px-4 py-5">
                        Teams access
                    </h4>
                    <SidebarMenuItem className="px-2 my-3">
                        <p className="text-xs text-muted-foreground leading-none px-2">
                            This settings also apply to future instances of this teams
                        </p>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="px-2">
                        <SidebarMenuButton asChild className="h-fit items-start hover:bg-sidebar active:bg-sidebar gap-0">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="host-join" className="font-semibold">
                                    Host must join before anyone else
                                </Label>
                                <Switch
                                    id="host-join"
                                    checked={controls.requireHost}
                                    onCheckedChange={
                                        (value) => onControlChange('requireHost', value)
                                    }
                                />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="px-2 mt-2">
                        <Label className="font-semibold px-2">
                            Access type
                        </Label>
                        <SidebarMenuSub className="border-none ml-1 mr-0 pr-0">
                            <SidebarMenuSubItem className="p-2 mt-4">
                                <RadioGroup
                                    className="gap-6"
                                    value={controls.access}
                                    onValueChange={
                                        (access: Access) => onControlChange('access', access)
                                    }
                                >
                                    <div className="flex gap-4">
                                        <RadioGroupItem id="access-open" value="open" className="mt-1" />
                                        <div className="space-y-0 5">
                                            <Label htmlFor="access-open" className="font-semibold">Open</Label>
                                            <p className="text-xs text-muted-foreground leading-none mr-2">
                                                No one has to ask when join. Anyone can dial in
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <RadioGroupItem id="access-trusted" value="trusted" className="mt-1" />
                                        <div className="space-y-0 5">
                                            <Label htmlFor="access-trusted" className="font-semibold">Trusted</Label>
                                            <p className="text-xs text-muted-foreground leading-none mr-2">
                                                Everyone must ask to join. Anyone can dial in
                                            </p>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
    ) : null
}