export type SidebarType = 'chat' | 'people' | 'detail' | 'host' | 'activity'
export type SidebarContent = (props: SidebarContentProps) => React.JSX.Element | null
export interface SidebarContentProps {
    open: boolean
    type: SidebarType
}