'use client'
import React from 'react'
import { toast } from "sonner";
import {
    delay,
    extractURL
} from '@/lib/utils';

import { Lobby } from './loby'
import { useChat } from '../use-chat';
import { useRoom } from '@/stores/room'
import { usePeople } from '../use-people'
import { useAppStore } from '@/stores/app'
import { useStream } from '@/stores/stream'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { useReaction } from '@/components/reaction';

import {
    ChatMessage,
    People
} from '@/types/stream'
import {
    Peer,
    MediaConnection
} from 'peerjs'
import {
    ControlAtom,
    useControls
} from './use-controls';

interface Props {
    id: string
    isHost: boolean
    control: ControlAtom
    children: React.ReactNode
}

export function SocketConnector({
    id,
    isHost,
    control,
    children
}: Props) {
    const chat = useChat()
    const app = useAppStore()
    const router = useRouter()
    const stream = useStream()
    const people = usePeople()

    const { user } = useAuthStore()
    const { showReaction } = useReaction()
    const { setControls } = useControls()
    const { socket, peer, ...room } = useRoom()

    // setup a peer & request join
    const openPeer = () => {
        room.setRoom({ status: 'loading' })
        const peer = new Peer({
            ...extractURL(process.env.NEXT_PUBLIC_PEER_URL ?? '')
        })

        peer.on('open', (peerId) => {
            socket.emit("request:join", {
                roomId: id,
                user: {
                    peerId,
                    host: room.host,
                    muted: stream.muted,
                    visible: stream.visible,
                    userId: user?.id,
                    name: user?.name,
                    photo: user?.photo,
                } as People,
            })
            room.setRoom({ peer, peerId, status: 'connected' })
        })

        peer.on("disconnected", () => {
            room.setRoom({ status: 'disconnected' })
        });

        peer.on('error', () => {
            room.setRoom({ status: 'disconnected' })
            if (!room.accept) {
                toast('Connection error', { id: room.roomId })
            }
        })
    }

    // people waiting a host accepted
    const onWaiting = (values: People[]) => {
        if (!room.host) return
        people.setPeopleWaiting(
            values.reduce((acc, value) => {
                acc[value.peerId] = value;
                return acc;
            }, {} as Record<string, People>)
        )

        toast('Someone want to join this call', {
            action: {
                label: 'Admit',
                onClick: () => {
                    values.forEach(v => {
                        socket.emit('request:accept', v.peerId)
                    })
                }
            }
        })
    }

    // accepted people
    const onAccepted = async (id: string) => {
        if (room.peerId !== id) return;
        app.set({ loading: true, message: 'Joining...' })
        await delay(1000)

        const list = people.peopleWaiting
        delete list[id]
        people.setPeopleWaiting(list)

        room.setRoom({ accept: true })
        socket.emit('room:join', {
            roomId: room.roomId,
            user: {
                host: room.host,
                peerId: room.peerId,
                muted: stream.muted,
                visible: stream.visible,
                userId: user?.id,
                name: user?.name,
                photo: user?.photo,
            } as People,
        })

        app.set({ loading: false, message: undefined })
    }

    // host rejected people
    const onRejected = (id: string) => {
        if (room.peerId === id) {
            toast('You are not allowed to join!')
            socket.disconnect()
            router.push('/')
        } else if (room.host) {
            const list = people.peopleWaiting
            delete list[id]
            people.setPeopleWaiting(list)
        }
    }

    // calling new joined user
    const onCalling = (value: People) => {
        if (!peer || !room.accept) return;

        if (!people.people[value.peerId]) {
            toast(`${value.host ? 'Host' : value.name} join the call`)
        }

        const media = stream.media ?? new MediaStream()
        const call = peer.call(value.peerId, media, {
            metadata: {
                peerId: room.peerId,
                muted: stream.muted,
                visible: stream.visible,
                userId: user?.id,
                name: user?.name,
                photo: user?.photo
            } as People
        });

        if (call) {
            console.log("📞 Calling", value.name)
            call.on('stream', (stream) => {
                people.setPeople({ [value.peerId]: { stream } })
                const videoTracks = stream.getVideoTracks();
                if (videoTracks.length > 1) {
                    people.setPresentId(value.peerId);
                    people.setSharedScreen(videoTracks[1]);
                }
            })

            call.on('close', () => {
                // 
            })
        }

        delete people.peopleWaiting[value.peerId]
        people.setPeopleWaiting(people.peopleWaiting)
        people.setPeople({ [value.peerId]: { ...value, call } })
    }

    // answer a call
    const onAnswer = (call: MediaConnection) => {
        if (!room.accept) return;

        const caller = call.metadata as People;
        if (!caller) {
            toast('⚠️ Incoming call has no metadata!');
            return;
        }

        console.log(`✅ Answering call from ${caller.name}`);
        call.answer(stream.media ?? new MediaStream());

        call.on('stream', (stream) => {
            people.setPeople({ [caller.peerId]: { stream } })
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 1) {
                people.setPresentId(caller.peerId);
                people.setSharedScreen(videoTracks[1]);
            }
        })

        call.on('close', () => {
            // toast('You has left the room')
        })

        people.setPeople({ [caller.peerId]: { ...caller, call } })
    }

    // reconnect a call
    const onReconnect = (user: People) => {
        if (room.peerId == user.peerId) {
            socket.emit('room:join', { roomId: room.roomId, user })
        }
    }

    // leave a room
    const onLeave = (id: string) => {
        const user = people.people[id]

        delete people.people[id]
        people.setPeople(people.people)

        // remove shared screen
        if (people.presentId === id) {
            people.setPresentId('')
            people.setSharedScreen(undefined)
        }

        delete people.peopleWaiting[id]
        people.setPeopleWaiting(people.peopleWaiting)

        if (room.peerId === id) {
            router.push('/')
        } else if (user?.name && room.accept) {
            toast(`${user?.name} has been left`)
        }
    }

    // toggle audio or video
    const onToggle = (key: 'muted' | 'visible', state?: boolean) => {
        return (peerId: string) => {
            people.setPeople({
                [peerId]: {
                    [key]: state ?? !people.people[peerId]?.[key]
                }
            })
        }
    }

    // toggle share screen
    const onScreen = (type: 'start' | 'stop') => {
        return (id: string) => {
            const user = people.people[id]
            if (type === 'start') {
                if (!peer) return;
                peer.disconnect();
                if (room.peerId !== id) {
                    toast(`${user.name} starting presenting screen`, { id: room.roomId });
                    stream.stopShareScreen()
                }
                peer.reconnect();
            } else {
                people.setSharedScreen(undefined)
                toast('Presenting screen has been stopped', { id: room.roomId });
            }
        }
    }

    // muted user by host
    const onMutedByHost = (id: string) => {
        if (room.peerId === id && !room.host) {
            stream.toggleMic(false);
            socket.emit('user:disable-microphone', {
                peerId: room.peerId,
                roomId: room.roomId
            })
            toast('You are muted by host', { id })
        }
    }

    // remove user from a call by host
    const onRemoveByHost = (id: string) => {
        if (room.peerId === id) {
            toast('Host removed you from the call')
            room.setRoom({ leave: true })
        }
    }

    // in-call message
    const onChatMessage = (message: ChatMessage) => {
        chat.setMessages(prev => [...prev, message])
        if (message.userId !== room.peerId) {
            room.setRoom({ unreadMessage: room.unreadMessage + 1 })
        }
    }

    // host control changed
    const onControlChanged = (state: ControlAtom) => {
        setControls(state)
        if (!room.host && room.accept) {
            if (!state.allowMicrophone) {
                stream.toggleMic(false);
                socket.emit('user:disable-microphone', {
                    peerId: room.peerId,
                    roomId: room.roomId
                })
                if (!stream.muted) {
                    toast('Microphone has been disabled by the host', { id: room.roomId })
                }
            }

            if (!state.allowVideo) {
                stream.turnOffCamera()
                socket.emit('user:disable-camera', {
                    peerId: room.peerId,
                    roomId: room.roomId
                })
                if (stream.visible) {
                    toast('Camera has been disabled by the host', { id: room.roomId })
                }
            }

            if (!state.allowShareScreen) {
                if (stream.sharedScreen) {
                    stream.stopShareScreen();
                    socket.emit('user:stop-share-screen', {
                        peerId: room.peerId,
                        roomId: room.roomId
                    })
                } else {
                    people.setSharedScreen(undefined)
                }
            }
        }
    }

    // initailize
    React.useEffect(() => {
        socket.emit('room:count', id)
        room.setRoom({ roomId: id, host: isHost })
        setControls(control)
    }, [id])

    // socket events
    React.useEffect(
        () => {
            peer?.on('call', onAnswer)

            const eventHandlers: [string, any][] = [
                ['request:waiting', onWaiting],
                ['request:accepted', onAccepted],
                ['request:rejected', onRejected],
                ['room:joined', onCalling],
                ['room:count', people.setCount],
                ['room:leave', onLeave],
                ['host:muted-user', onMutedByHost],
                ['host:removed-user', onRemoveByHost],
                ['user:toggled-audio', onToggle('muted')],
                ['user:disable-microphone', onToggle('muted', true)],
                ['user:toggled-video', onToggle('visible')],
                ['user:disable-camera', onToggle('visible', false)],
                ['user:shared-screen', onScreen('start')],
                ['user:stopped-screen-share', onScreen('stop')],
                ['user:control-changed', onControlChanged],
                ['user:reacted', showReaction],
                ['user:reconnect', onReconnect],
                ['chat:get', onChatMessage],
                ['error:change-control', () =>
                    toast('failed to change control', { id: room.roomId })],
                ['disconnect', () => {
                    if (room.accept) {
                        toast("Connection error, reloading...");
                        setTimeout(() => window.location.reload(), 3000);
                    }
                }],
            ];

            eventHandlers.forEach(([event, handler]) => socket.on(event, handler));

            return () => {
                eventHandlers.forEach(([event, handler]) => socket.off(event, handler));
            };
        },
        [socket, peer, room]
    )

    if (app.loading) return null;
    if (!room.accept) {
        return <Lobby onJoin={openPeer} />
    }

    return children
}