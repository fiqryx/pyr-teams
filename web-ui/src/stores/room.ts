import { Peer } from "peerjs";
import { create } from 'zustand';
import { socket } from "@/lib/socket"

type PeerStatus = 'connected' | 'disconnected' | 'loading' | 'idle'

export interface RoomState {
    publicKey: string
    roomId: string
    peerId: string
    peer?: Peer
    socket: typeof socket
    host: boolean
    accept: boolean
    leave: boolean
    unreadMessage: number
    status: PeerStatus
}

export interface RoomStore extends RoomState {
    setRoom: (state: Partial<RoomState>) => void
    resetRoom: () => void
}

export const useRoom = create<RoomStore>((setter) => ({
    publicKey: '',
    roomId: '',
    socket,
    peerId: '',
    host: false,
    accept: false,
    leave: false,
    unreadMessage: 0,
    status: 'idle',

    setRoom: (state) => setter(
        (prev) => ({ ...prev, ...state })
    ),

    resetRoom: () => setter({})
}))