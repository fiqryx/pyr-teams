"use client"
import { User } from "@/types/user"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSupabaseClient } from "@/lib/supabase/client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    LogOut,
    BadgeCheck,
    UserIcon,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavUser({ user }: { user: User }) {
    const isMobile = useIsMobile()
    const supabase = useSupabaseClient()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="border rounded-full">
                <Avatar className="size-9">
                    <AvatarImage src={user.photo} alt={user.name} />
                    <AvatarFallback className="font-semibold">
                        {user.name.slice(0, 2)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={4}
                side={!isMobile ? "bottom" : "right"}
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user?.photo} alt={user?.name} />
                            <AvatarFallback className="rounded-lg">
                                <UserIcon className="size-4 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        {user && (
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {user.name}
                                </span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <BadgeCheck />
                        Account
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            supabase.auth.signOut().then(
                                () => window.location.reload()
                            )
                        }}
                    >
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}