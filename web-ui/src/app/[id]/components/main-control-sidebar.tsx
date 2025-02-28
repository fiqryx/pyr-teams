'use client'
import React from 'react'
import { cn } from '@/lib/utils'

import { useRoom } from '@/stores/room'
import { usePeople } from '../use-people'

import { SidebarType } from '@/types/misc'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip'
import {
    MessageSquareText,
    Users,
    Info,
    LockKeyhole,
} from 'lucide-react'

interface SideControlProps extends
    React.ComponentProps<'div'> {
    onOpenChange: (type: SidebarType) => void
}

export function ControlSidebar({
    className,
    onOpenChange,
    ...props
}: SideControlProps) {
    const room = useRoom()
    const { count } = usePeople()

    return (
        <div {...props} className={cn('hidden lg:flex', className)}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onOpenChange('detail')}
                            className='relative [&_svg]:size-5 rounded-full'
                        >
                            <Info />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Details</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onOpenChange('chat')}
                            className='relative [&_svg]:size-5 rounded-full'
                        >
                            <MessageSquareText />
                            {room.unreadMessage > 0 && (
                                <span className='absolute top-1 right-1 rounded-full border bg-red-500 text-xs text-white transform -translate-y-1/2 translate-x-1/2 flex items-center justify-center px-1.5'>
                                    {room.unreadMessage}
                                </span>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Chat with everyone</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onOpenChange('people')}
                            className='relative [&_svg]:size-5 rounded-full'
                        >
                            <Users />
                            <span className='absolute top-1 right-1 rounded-full border bg-green-500 text-xs text-white transform -translate-y-1/2 translate-x-1/2 flex items-center justify-center px-1.5'>
                                {count || 1}
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>People</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onOpenChange('activity')}
                            className='relative [&_svg]:size-5 rounded-full'
                        >
                            <Icons.shape />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Activities</TooltipContent>
                </Tooltip>
                {room.host && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onOpenChange('host')}
                                className='relative [&_svg]:size-5 rounded-full'
                            >
                                <LockKeyhole />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Host controls</TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        </div>
    )
}