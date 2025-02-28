import {
    atom,
    useAtom,
    SetStateAction
} from "jotai"
import {
    AccessControl,
    ModerationControl
} from "@/types/control"

export type ControlAtom = ModerationControl & AccessControl

export const controlAtom = atom<ControlAtom>({
    hostManagement: false,
    allowShareScreen: true,
    allowSendChat: true,
    allowReaction: true,
    allowMicrophone: true,
    allowVideo: true,
    requireHost: true,
    access: 'trusted',
})

export function useControls() {
    const [controls, setter] = useAtom(controlAtom)

    const setControls = (state: SetStateAction<Partial<ControlAtom>>) => {
        setter(prev => ({
            ...prev,
            ...(typeof state === "function" ? state(prev) : state),
        }));
    };

    return {
        controls,
        setControls
    }
}