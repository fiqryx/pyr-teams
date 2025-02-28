'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { emotions } from '@/lib/emotions'

import { useRoom } from '@/stores/room'
import { useChat } from '../../use-chat'
import { useAuthStore } from '@/stores/auth'
import { useControls } from '../use-controls'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { ChatMessage } from '@/types/stream'
import { SidebarContentProps } from '@/types/misc'

import {
    Laugh,
    Send
} from 'lucide-react'
import {
    SidebarContent,
    SidebarFooter,
} from '@/components/ui/sidebar'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"

export function ChatContent({ open, type }: SidebarContentProps) {
    const room = useRoom()
    const { user } = useAuthStore()
    const { controls } = useControls()
    const { formatTime, ...chat } = useChat()

    const disableChat = !room.host && !controls.allowSendChat;
    const textRef = React.useRef<HTMLTextAreaElement | null>(null)
    const messageRef = React.useRef<HTMLDivElement | null>(null)

    function onSendMessage() {
        if (!chat.text.trim() || disableChat) return;
        const last = chat.messages.at(-1)
        const timestamp = Date.now()

        const message: ChatMessage = {
            text: chat.text,
            userId: room.peerId,
            name: user!.name,
            timestamp,
            aggregate: last && (last.userId !== room.peerId ||
                !(formatTime(timestamp) === formatTime(last.timestamp))
            )
        }

        room.socket.emit('chat:post', { message, roomId: room.roomId });
        chat.setMessages(prev => [...prev, message])
        chat.setText('')
    }

    React.useEffect(() => {
        if (open && type === 'chat') {
            room.setRoom({ unreadMessage: 0 })
        }
    }, [open, type, chat.messages])

    React.useEffect(() => {
        if (textRef.current) {
            textRef.current.scrollTop = textRef.current.scrollHeight;
        }
    }, [chat.text])

    React.useEffect(() => {
        messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat.messages])

    return (
        <>
            <SidebarContent className="px-2 flex flex-col pb-2 gap-2">
                {chat.messages?.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            'flex flex-col gap-0.5',
                            msg.userId === room.peerId ? "items-end" : "items-start"
                        )}
                    >
                        {msg.aggregate !== false && (
                            <span className="text-xs text-muted-foreground">
                                {msg.userId === room.peerId ? 'You' : msg.name}
                            </span>
                        )}
                        <div
                            ref={idx === chat.messages.length - 1 ? messageRef : null}
                            className={cn(
                                'relative p-2 max-w-48 rounded-xl shadow-md break-words',
                                msg.userId === room.peerId ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-black rounded-bl-none"
                            )}
                        >
                            <p className="text-sm text-wrap">{msg.text}</p>
                            <div className="mt-1 text-xs opacity-70 text-right">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </SidebarContent>
            <SidebarFooter className="flex-row items-center border-t">
                <Textarea
                    ref={textRef}
                    value={chat.text}
                    disabled={disableChat}
                    className='text-xs resize-none w-56 h-10 min-h-10'
                    onChange={(e) => chat.setText(e.target.value)}
                    placeholder={disableChat ? 'Restricted at the moment' : 'Send a message to everyone'}
                    onKeyDown={(e) => {
                        if (disableChat) return
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSendMessage();
                        }
                    }}
                />
                <TooltipProvider>
                    <Tooltip>
                        <Popover>
                            <PopoverTrigger asChild>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" disabled={disableChat}>
                                        <Laugh />
                                    </Button>
                                </TooltipTrigger>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-1" align='end'>
                                <Tabs defaultValue="emotions">
                                    <TabsList className='w-full rounded-sm'>
                                        {Object.values(emotions).map(({ key, icon: Comp }, idx) => (
                                            <TabsTrigger key={idx} value={key} className='p-2'>
                                                <Comp className='size-4' />
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    {Object.values(emotions).map(({ key, title, values }, idx) => (
                                        <TabsContent key={idx} value={key} className='mt-1'>
                                            <span className='text-xs text-muted-foreground p-1'>{title}</span>
                                            <ScrollArea className='h-48'>
                                                {values.map((emoji, idx) => (
                                                    <Button
                                                        key={idx}
                                                        size="icon"
                                                        variant="ghost"
                                                        className='text-lg size-8'
                                                        onClick={() => chat.setText(chat.text + emoji)}
                                                    >
                                                        {emoji}
                                                    </Button>
                                                ))}
                                            </ScrollArea>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </PopoverContent>
                        </Popover >
                        <TooltipContent align="center">
                            Emoji
                        </TooltipContent>
                    </Tooltip >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                disabled={disableChat}
                                onClick={onSendMessage}
                            >
                                <Send />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent align="end">
                            Send a message
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider >
            </SidebarFooter >
        </>
    )
}