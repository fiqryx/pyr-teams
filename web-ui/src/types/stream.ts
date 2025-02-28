export type Status = 'loading' | 'idle' | 'rejected' | 'success';

// @ts-ignore
export type VideoCallback = (track: MediaStreamTrack) => void;

export type Kind =
    | 'audio'
    | 'video'
    | 'chat'
    | 'users'
    | 'screen'
    | 'fullscreen';

export type ChatMessage = {
    userId: string
    name: string
    text: string
    timestamp: number
    aggregate?: boolean
};

export type People = {
    userId: string
    peerId: string
    name: string
    photo?: string
    muted: boolean
    visible: boolean
    host: boolean
}

export interface ShareScreenOptions {
    onStart?: () => void
    onEnded?: () => void
    onError?: (error: string) => void
}