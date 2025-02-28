import React from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    Sidebar,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends
    Omit<React.ComponentProps<typeof Sidebar>, 'onClick'> {
    onClose?: React.MouseEventHandler<HTMLButtonElement>
}

export function AppSidebar({
    title,
    children,
    onClose,
    ...props
}: AppSidebarProps) {
    return (
        <Sidebar {...props}>
            <div className="relative flex">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                    className='absolute right-2 top-2 size-6 [&_svg]:size-4'
                >
                    <XIcon />
                </Button>
            </div>
            <SidebarHeader className="text-md text-sidebar-foreground font-semibold p-3">
                {title}
            </SidebarHeader>
            {children}
            <SidebarRail />
        </Sidebar>
    )
}