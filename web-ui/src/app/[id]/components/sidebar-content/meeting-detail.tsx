'use client'
import React from "react"

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarContent } from '@/components/ui/sidebar'

import {
    Copy,
    CopyCheck,
} from 'lucide-react'

export function MeetingDetailContent() {
    const [isCopied, setIsCopied] = React.useState(false)

    return (
        <SidebarContent className="px-2 flex flex-col gap-2">
            <div className="grid w-full max-w-sm items-center mt-4 gap-1.5">
                <Label htmlFor="url">Joining info</Label>
                <Input
                    disabled
                    id="url"
                    placeholder='meeting url'
                    className='text-xs disabled:cursor-default'
                    value={window.location.href.replace(/^https?:\/\//, "")}
                />
            </div>
            <Button
                size="sm"
                variant="ghost"
                className='w-fit'
                onClick={() => {
                    if (!isCopied) {
                        navigator.clipboard.writeText(window.location.href);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                    }
                }}
            >
                {!isCopied ? <Copy /> : <CopyCheck />}
                Copy
            </Button>
            <Separator className="mt-2" />
        </SidebarContent>
    )
}