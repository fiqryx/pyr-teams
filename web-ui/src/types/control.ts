export type Access = 'open' | 'trusted'

export interface ModerationControl {
    hostManagement: boolean
    allowShareScreen: boolean
    allowSendChat: boolean
    allowReaction: boolean
    allowMicrophone: boolean
    allowVideo: boolean
}

export interface AccessControl {
    requireHost: boolean
    access: Access
}