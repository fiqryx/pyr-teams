'use client'
import React from 'react'
import { cn } from '@/lib/utils'

import { useRoom } from '@/stores/room'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'

import {
    Input,
    InputIcon
} from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Copy,
    XIcon,
    CheckIcon,
} from 'lucide-react'

export function PopupTeams({
    className,
    ...props
}: React.ComponentProps<typeof PopoverContent>) {
    const room = useRoom()
    const { user } = useAuthStore()
    const [popup, setPopup] = React.useState(true)
    const [isCopied, setIsCopied] = React.useState(false)

    const url = React.useMemo(() => (
        window.location.href.replace(/^https?:\/\//, "")
    ), [])

    const onCopy = () => {
        if (!isCopied) {
            navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }

    return (
        <Popover open={popup && room.host}>
            <PopoverTrigger className='absolute bottom-0 left-0 hidden lg:block' />
            <PopoverContent
                {...props}
                className={cn('w-80', className)}
            >
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setPopup(!popup)}
                    className='absolute right-2 top-2 size-6 [&_svg]:size-4'
                >
                    <XIcon />
                </Button>
                <h3 className="text-md font-semibold">
                    Your team's ready
                </h3>
                <div className="flex flex-col mt-3 gap-2">
                    <p className="text-sm text-muted-foreground">
                        Share this link with others you want
                    </p>
                    <Input
                        disabled
                        value={url}
                        cursor='default'
                    >
                        <InputIcon
                            position='right'
                            onClick={onCopy}
                            className='cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground p-1'
                        >
                            {isCopied ? <CheckIcon className='size-3.5' /> : <Copy className='size-3.5' />}
                        </InputIcon>
                    </Input>
                    <p className="text-xs text-muted-foreground truncate">
                        Joined as {user?.email}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    )
}