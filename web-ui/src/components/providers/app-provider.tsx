'use client'
import React from 'react'
import { useAppStore } from '@/stores/app'
import { usePathname } from 'next/navigation'
import { Loading } from '@/components/ui/loading'

interface Props {
    children?: React.ReactNode
}

export function AppProvider({ children }: Props) {
    const pathname = usePathname()
    const { initialize, loading, message, init } = useAppStore()

    React.useEffect(() => {
        if (!initialize) init()
    }, [pathname, initialize])

    // React.useEffect(() => {
    //     if (pathname === '/') return
    //     const handleContextMenu = (event: MouseEvent) => event.preventDefault();
    //     const handleCopy = (event: ClipboardEvent) => event.preventDefault();
    //     const handleCut = (event: ClipboardEvent) => event.preventDefault();

    //     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    //         // e.preventDefault(); //* enable to show confirmation popup
    //         //* add more event here...
    //     };

    //     document.addEventListener("contextmenu", handleContextMenu);
    //     document.addEventListener("copy", handleCopy);
    //     document.addEventListener("cut", handleCut);
    //     window.addEventListener("beforeunload", handleBeforeUnload);

    //     return () => {
    //         document.removeEventListener("contextmenu", handleContextMenu);
    //         document.removeEventListener("copy", handleCopy);
    //         document.removeEventListener("cut", handleCut);
    //         window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    // }, [pathname]);

    return (
        <div className='relative overflow-hidden'>
            {children}
            {loading && (
                <Loading
                    size="lg"
                    variant="spinner"
                    className='fixed top-0 z-50 h-screen bg-black/95 text-white text-xl gap-4 animate-fade animate-duration-500 animate-delay-100 animate-ease-linear'
                >
                    {message || 'Loading...'}
                </Loading>
            )}
        </div>
    )
}