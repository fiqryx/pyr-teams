'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { useStream } from '@/stores/stream'

import { ChatContent } from './sidebar-content/chat'
import { AppSidebar } from '@/components/app-sidebar'
import { MainControl } from './main-control'
import { PeopleContent } from './sidebar-content/people'
import { ReactionContainer } from '@/components/reaction'
import { PictureInPictureContent } from './main-pip-content'
import { HostControls } from './sidebar-content/host-control'
import { MeetingDetailContent } from './sidebar-content/meeting-detail'

import {
    DocumentPip,
    DocumentPipRef,
} from "@/components/picture-in-picture"
import {
    SidebarType,
    SidebarContent
} from '@/types/misc'
import {
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar'

type Content = {
    title: string
    compoent?: SidebarContent
}

const sidebarContet: Record<SidebarType, Content> = {
    detail: {
        title: 'Call details',
        compoent: MeetingDetailContent
    },
    chat: {
        title: 'In-Call messages',
        compoent: ChatContent
    },
    people: {
        title: 'People',
        compoent: PeopleContent
    },
    host: {
        title: 'Host controls',
        compoent: HostControls
    },
    activity: {
        title: 'Activities'
    }
}


export function MainLayout({
    className,
    children,
    ...props
}: React.ComponentProps<'div'>) {
    const stream = useStream()
    const pipRef = React.useRef<DocumentPipRef>(null)

    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const [type, setType] = React.useState<SidebarType>('chat')
    const { title, compoent: Comp } = sidebarContet[type]

    const onOpenChange = (state: SidebarType) => {
        setType(state)
        setSidebarOpen(
            state !== type || !sidebarOpen
        )
    }

    React.useEffect(() => {
        if (pipRef.current) {
            const method = stream.pictureInPicture ? 'open' : 'close';
            pipRef.current[method]()
        }
    }, [pipRef, stream.pictureInPicture])

    return (
        <SidebarProvider
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
            style={
                {
                    "--sidebar-width": `20rem`,
                    "--sidebar-width-mobile": "20rem",
                } as React.CSSProperties
            }
        >
            <SidebarInset>
                <DocumentPip
                    shareStyles
                    ref={pipRef}
                    width={320}
                    height={420}
                    onClose={() => stream.set({ pictureInPicture: false })}
                    onOpen={() => stream.set({ pictureInPicture: true })}
                    buttonRenderer={(
                        <div
                            {...props}
                            className={cn(
                                'flex flex-col h-screen',
                                className
                            )}
                        >
                            {children}
                            <MainControl open={sidebarOpen} onOpenChange={onOpenChange} />
                        </div>
                    )}
                >
                    <ReactionContainer size="xs" className="bottom-[3rem]">
                        <PictureInPictureContent />
                    </ReactionContainer>
                </DocumentPip>
            </SidebarInset>
            <AppSidebar
                side="right"
                title={title}
                forceSheet
                disableMobileTrigger
                onClose={() => setSidebarOpen(!sidebarOpen)}
            >
                {Comp && <Comp open={sidebarOpen} type={type} />}
            </AppSidebar>
        </SidebarProvider>
    )
}