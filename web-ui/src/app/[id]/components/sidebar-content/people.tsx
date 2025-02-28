'use client'
import React from "react"
import { cn } from "@/lib/utils"
import { debounce } from "lodash"
import * as Icon from 'lucide-react'

import { useRoom } from '@/stores/room'
import { useStream } from "@/stores/stream"
import { useAuthStore } from "@/stores/auth"

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SidebarContent } from '@/components/ui/sidebar'

import {
    usePeople,
    People
} from "../../use-people"
import {
    Input,
    InputIcon
} from '@/components/ui/input'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { useControls } from "../use-controls"

export function PeopleContent() {
    const { user } = useAuthStore()
    const { controls } = useControls()
    const { muted, status, toggleMic } = useStream()
    const { host, socket, peerId, roomId } = useRoom()
    const { people, peopleWaiting, setPeople, setPeopleWaiting } = usePeople()

    const [searchTerm, setSearchTerm] = React.useState("");
    const [waitingIsOpen, setWaitingIsOpen] = React.useState(true)
    const [waitingLists, setWaitingLists] = React.useState<People[]>([])
    const [contributorOpen, setContributorOpen] = React.useState(true)
    const [contributorsList, setContributorsList] = React.useState<People[]>([])

    const isRejected = status === 'rejected';
    const microphoneActive = !muted && !isRejected;
    const allMuted = contributorsList.every(v => v.muted);
    const waitingIsFilled = searchTerm && waitingLists.length > 0;
    const contributorIsFilled = searchTerm && contributorsList.length > 0;

    const onSearch = React.useCallback(
        debounce((value: string) => {
            setWaitingIsOpen(true)
            setWaitingLists(Object.values(peopleWaiting).filter((person) =>
                person?.name?.toLowerCase().includes(value.toLowerCase())
            ));
            setContributorOpen(true)
            setContributorsList(Object.values(people).filter((person) =>
                person?.name?.toLowerCase().includes(value.toLowerCase())
            ));
        }, 300),
        [people, peopleWaiting]
    );

    const onWaiting = (e: 'accept' | 'reject', peerId?: string) => () => {
        if (!host) return;

        if (peerId !== undefined) {
            delete peopleWaiting[peerId]
            setPeopleWaiting(peopleWaiting)
            socket.emit(`request:${e}`, peerId)
        } else {
            const list = peopleWaiting;
            waitingLists.forEach((v) => {
                delete list[v.peerId!]
                socket.emit(`request:${e}`, v.peerId)
            })
            setPeopleWaiting(list)
        }
    }

    React.useEffect(() => {
        setContributorsList(Object.values(people))
        setWaitingLists(Object.values(peopleWaiting))
    }, [people, peopleWaiting])

    return (
        <SidebarContent className="px-2 flex flex-col gap-5">
            {host && !allMuted && (
                <div className="flex flex-wrap mt-4 gap-2">
                    <Button
                        size="sm"
                        className={`${allMuted ? 'hidden' : ''}`}
                        onClick={() => {
                            Object.values(people).forEach(({ peerId }) => {
                                socket.emit('host:mute-user', { roomId, peerId })
                            })
                        }}
                    >
                        <Icon.MicOff />
                        All muted
                    </Button>
                </div>
            )}
            <Input
                value={searchTerm}
                placeholder="Search people"
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    onSearch(e.target.value);
                }}
            >
                <InputIcon
                    position="right"
                    onClick={() => searchTerm && setSearchTerm('')}
                    className={cn(
                        'rounded-lg [&_svg]:size-4',
                        searchTerm && 'cursor-pointer p-1 hover:bg-secondary/80'
                    )}
                >
                    {searchTerm ? <Icon.XIcon /> : <Icon.Search />}
                </InputIcon>
            </Input>
            {(host && (!searchTerm || waitingIsFilled)) && controls.access === 'trusted' && (
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label className="text-muted-foreground">
                        Waiting to join
                    </Label>
                    <Collapsible
                        open={waitingIsOpen}
                        onOpenChange={setWaitingIsOpen}
                        className="border rounded-md"
                    >
                        <div className="flex items-center justify-between gap-4 p-2">
                            <p className="text-xs font-semibold">
                                Waiting to be admitted
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold">
                                    {waitingLists.length}
                                </span>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Icon.ChevronDown className={`h-4 w-4 ${waitingIsOpen ? 'rotate-180' : ''}`} />
                                        <span className="sr-only">Toggle</span>
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </div>
                        <CollapsibleContent className="border-t p-2 space-y-4">
                            {waitingLists.length ? (
                                <>
                                    {waitingLists.length > 1 && (
                                        <div className="flex justify-end items-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={onWaiting('reject')}
                                            >
                                                Denny all
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={onWaiting('accept')}
                                            >
                                                Admit all
                                            </Button>
                                        </div>
                                    )}
                                    <div className="max-h-48 overflow-auto">
                                        {waitingLists.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center gap-2">
                                                <div className="inline-flex items-center gap-2">
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={item.photo} />
                                                        <AvatarFallback>
                                                            {item.name?.slice(0, 1)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <p className="text-xs font-semibold max-w-32 truncate">
                                                        {item.name}
                                                    </p>
                                                </div>
                                                <div className="inline-flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        onClick={onWaiting('accept', item.peerId ?? '')}
                                                    >
                                                        Admit
                                                    </Button>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="rounded-full">
                                                                <Icon.EllipsisVertical />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="end" className="w-60 p-0">
                                                            <Button
                                                                variant="ghost"
                                                                className='justify-start rounded-none w-full'
                                                                onClick={onWaiting('reject', item.peerId ?? '')}
                                                            >
                                                                <Icon.UserMinus />
                                                                Deny entry
                                                            </Button>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-center items-center text-xs text-muted-foreground">
                                    No one is waiting
                                </div>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            )}

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label className="text-muted-foreground">
                    In meeting
                </Label>
                <Collapsible
                    open={contributorOpen}
                    onOpenChange={setContributorOpen}
                    className="border rounded-md"
                >
                    <div className="flex items-center justify-between gap-4 p-2">
                        <p className="text-xs font-semibold">
                            Contributors
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">
                                {contributorsList.length + 1}
                            </span>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Icon.ChevronDown className={`h-4 w-4 ${contributorOpen ? 'rotate-180' : ''}`} />
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>
                    <CollapsibleContent className="max-h-48 overflow-auto border-t p-2 space-y-2">
                        {!searchTerm && (
                            <div className="flex justify-between items-center gap-2">
                                <div className="inline-flex items-center gap-2">
                                    <Avatar className="size-8">
                                        <AvatarImage src={user?.photo} />
                                        <AvatarFallback>
                                            {user?.name.slice(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs font-semibold max-w-32 truncate">
                                        You
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        onClick={() => {
                                            if (isRejected) return;
                                            toggleMic();
                                            socket.emit('user:toggle-audio', { peerId, roomId })
                                        }}
                                    >
                                        {microphoneActive ? <Icon.Mic /> : <Icon.MicOff />}
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button size="icon" variant="ghost" className="rounded-full">
                                                <Icon.EllipsisVertical />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-60 p-0">
                                            <Button
                                                variant="ghost"
                                                className='justify-start rounded-none w-full'
                                            >
                                                <Icon.Pin />
                                                Pin to the screen
                                            </Button>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}

                        {(!searchTerm || contributorIsFilled) ? contributorsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-2">
                                <div className="inline-flex items-center gap-2">
                                    <Avatar className="size-8">
                                        <AvatarImage src={item.photo} />
                                        <AvatarFallback>
                                            {item.name?.slice(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs font-semibold max-w-32 truncate">
                                        {item.name}
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={item.muted || !host}
                                        onClick={() => {
                                            if (host && !item.muted) {
                                                socket.emit('host:mute-user', {
                                                    roomId,
                                                    peerId: item.peerId
                                                })
                                            }
                                        }}
                                    >
                                        {item.muted ? <Icon.MicOff /> : <Icon.Mic />}
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button size="icon" variant="ghost" className="rounded-full">
                                                <Icon.EllipsisVertical />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-60 p-0">
                                            <Button
                                                variant="ghost"
                                                className='justify-start rounded-none w-full'
                                            >
                                                <Icon.Pin />
                                                Pin to the screen
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                disabled={!item.visible}
                                                className='justify-start rounded-none w-full'
                                                onClick={() => {
                                                    setPeople({ [item.peerId!]: { dontWatch: !item.dontWatch } })
                                                }}
                                            >
                                                {item.dontWatch ? <Icon.Video /> : <Icon.VideoOff />}
                                                {item.dontWatch ? 'Watch' : "Don't watch"}
                                            </Button>
                                            {host && (
                                                <Button
                                                    variant="ghost"
                                                    className='justify-start rounded-none w-full'
                                                    onClick={() => {
                                                        socket.emit('host:remove-user', {
                                                            roomId,
                                                            peerId: item.peerId
                                                        })
                                                    }}
                                                >
                                                    <Icon.CircleMinus />
                                                    Remove from the call
                                                </Button>
                                            )}
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )) : (
                            <div className="flex justify-center items-center text-xs text-muted-foreground">
                                No found contributor
                            </div>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </SidebarContent >
    )
}