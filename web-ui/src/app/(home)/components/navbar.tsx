'use client'
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { buttonVariants } from "@/components/ui/button";

import { NavUser } from "@/components/nav-user";
import { ToggleTheme } from "@/components/toggle-theme";
import { SettingsDialog } from "@/components/settings-dialog";
import { Settings } from "lucide-react";
import { Icons } from "@/components/icons";

export function Navbar({
    className,
    ...props
}: React.ComponentProps<'header'>) {
    const { user } = useAuthStore()
    const [date, setDate] = React.useState(new Date())

    React.useEffect(() => {
        const interval = setInterval(() => {
            setDate(new Date())
        }, 1000);

        return () => clearInterval(interval)
    }, [])

    return (
        <header
            {...props}
            className={cn(
                'sticky top-0 z-50 flex shrink-0 items-center w-full h-14 bg-background border-b transition-[width,height] ease-linear px-4',
                className
            )}
        >
            <div className="container flex justify-between mx-auto gap-2">
                <div className="flex items-center gap-1.5">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icons.logo className="size-6" />
                    </div>
                    <p className="text-lg font-semibold">
                        {process.env.APP_NAME}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:inline-flex text-sm gap-1.5">
                        <span>
                            {date.toLocaleString("en", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                            })}
                        </span>
                        <span> • </span>
                        <span>
                            {date.toLocaleString("en", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>
                    <SettingsDialog asChild tooltip tooltipSide="bottom">
                        <div className="block">
                            <button className="inline-flex items-center rounded-full p-[3px] hover:bg-accent hover:text-accent-foreground">
                                <Settings className="size-7 rounded-full p-1" />
                            </button>
                        </div>
                    </SettingsDialog>
                    <div className="hidden sm:inline-flex gap-2">
                        <ToggleTheme />
                        {user ? <NavUser user={user} /> : (
                            <Link href="/sign-in" className={buttonVariants()}>
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}