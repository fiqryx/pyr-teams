'use client'
import React from 'react'
import { toast } from "sonner";
import { createRoom } from '@/app/actions';

import { Loading } from '@/components/ui/loading';

import {
    Copy,
    CheckIcon,
} from "lucide-react";
import {
    Input,
    InputIcon
} from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';

export function MeetLinkDialog({ children }: React.PropsWithChildren) {
    const [code, setCode] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [isCopied, setIsCopied] = React.useState(false)

    async function onCreateRoom() {
        setIsLoading(true)
        const { error, room } = await createRoom()

        if (error) {
            toast(error)
            return
        }

        setCode(
            room ? `${window.location.origin}/${room}`
                : 'Failed to create room, please try again.'
        )
        setIsLoading(false)
    }

    function onCopy() {
        if (!isCopied) {
            navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }

    return (
        <Dialog
            onOpenChange={(open) => {
                if (open) onCreateRoom()
            }}
        >
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-sm'>
                <DialogHeader>
                    <DialogTitle>Here's your joining info</DialogTitle>
                    <DialogDescription>
                        Share this link with others to invite them to your team.
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? <Loading variant="spinner" /> : (
                    <Input
                        readOnly
                        placeholder="Meeting link"
                        value={code.replace(/^https?:\/\//, "")}
                        className='text-xs text-muted-foreground'
                    >
                        <InputIcon
                            position='right'
                            onClick={onCopy}
                            className='cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground p-1'
                        >
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {isCopied ? <CheckIcon className='size-3.5' /> : <Copy className='size-3.5' />}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isCopied ? 'Copied' : 'Copy'}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </InputIcon>
                    </Input>
                )}
            </DialogContent>
        </Dialog>
    )
}