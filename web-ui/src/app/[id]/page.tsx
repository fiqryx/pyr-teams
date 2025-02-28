import { omit } from "lodash";
import { getRoom } from "../actions";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/metadata"

import { MainLayout } from "./components/main-layout";
import { ReactionContainer } from "@/components/reaction";
import { SocketConnector } from "./components/socket-connector";
import { MainVideoStream } from "./components/mian-video-stream";
import { StreamProvider } from "@/components/providers/stream-provider";

interface Params {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Params) {
    const { id } = await params;
    const { error } = await getRoom(id)

    return createMetadata({
        title: error ? '404: This page could not be found'
            : `${process.env.APP_NAME} - ${id}`,
    })
}

export default async function Page({ params }: Params) {
    const { id } = await params;
    const { error, room, host } = await getRoom(id)

    if (error != null) {
        return notFound()
    }

    return (
        <StreamProvider>
            <ReactionContainer className="bottom-[3rem]">
                <SocketConnector
                    id={room.roomId}
                    isHost={host}
                    control={omit(room.control, 'id', 'createdAt', 'updatedAt')}
                >
                    <MainLayout>
                        <MainVideoStream />
                    </MainLayout>
                </SocketConnector>
            </ReactionContainer>
        </StreamProvider>
    )
}