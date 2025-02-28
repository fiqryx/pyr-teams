'use client'
import React from 'react';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface VisualEffectsProps extends
    React.ComponentProps<typeof DialogTrigger> {
    tooltip?: boolean
}

export function VisualEffects({
    tooltip,
    ...props
}: VisualEffectsProps) {
    return (
        <Dialog>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger {...props} />
                    </TooltipTrigger>
                    <TooltipContent hidden={!tooltip}>
                        Apply visual effects
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Visual effects</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-center min-h-52">
                    <p className="text-sm text-muted-foreground">
                        Coming soon
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}