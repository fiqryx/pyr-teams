import type { MediaConnection } from "peerjs"
import type { People as Participant } from "@/types/stream"

import {
    atom,
    useAtom,
    SetStateAction,
} from "jotai"

export interface People extends Partial<Participant> {
    call?: MediaConnection
    stream?: MediaStream
    dontWatch?: boolean
}
export type PeopleAtom = Record<string, People>

export const countAtom = atom(0);
export const peresentIdAtom = atom('');
export const sharedScreenAtom = atom<MediaStreamTrack>();
export const peopleAtom = atom<Record<string, People>>({});
export const peopleWaitingAtom = atom<Record<string, People>>({});

export function usePeople() {
    const [count, setCount] = useAtom(countAtom);
    const [presentId, setPresentId] = useAtom(peresentIdAtom);
    const [sharedScreen, setSharedScreen] = useAtom(sharedScreenAtom);
    const [people, setterPeople] = useAtom(peopleAtom);
    const [peopleWaiting, setterPeopleWaiting] = useAtom(peopleWaitingAtom);

    const setPeople = (update: SetStateAction<PeopleAtom>) => {
        setterPeople(prev => {
            if (typeof update === 'function') {
                return { ...prev, ...update(prev) };
            }

            const state = Object.fromEntries(
                Object.entries(update).map(([id, value]) => [
                    id,
                    { ...(prev[id]), ...value }
                ])
            );

            return { ...prev, ...state }
        })
    };

    const setPeopleWaiting = (update: SetStateAction<PeopleAtom>) => {
        setterPeopleWaiting(prev => {
            if (typeof update === 'function') {
                return { ...prev, ...update(prev) };
            }

            const state = Object.fromEntries(
                Object.entries(update).map(([id, value]) => [
                    id,
                    { ...(prev[id]), ...value }
                ])
            );

            return { ...prev, ...state }
        })
    };

    const resetPeople = () => {
        setPeople({})
        setPeopleWaiting({})
    }

    return {
        count,
        presentId,
        sharedScreen,
        people,
        peopleWaiting,
        setCount,
        setPresentId,
        setSharedScreen,
        setPeople,
        setPeopleWaiting,
        resetPeople
    }
}