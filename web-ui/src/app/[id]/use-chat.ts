import { ChatMessage } from '@/types/stream'
import {
    atom,
    useAtom,
} from "jotai"

export const textAtom = atom('')
export const messageAtom = atom<ChatMessage[]>([])

export function useChat() {
    const [text, setText] = useAtom(textAtom)
    const [messages, setMessages] = useAtom(messageAtom)

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes()}`;
    }

    return {
        text,
        messages,
        setText,
        setMessages,
        formatTime
    }
}