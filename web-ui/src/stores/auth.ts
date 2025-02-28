import { create } from 'zustand';
import { User } from '@/types/user';

export interface AuthState {
    user?: User
}

export interface AuthStore extends AuthState {
    set: (state: Partial<AuthState>) => void
    reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({

    set: (state) => set(
        (prev) => ({ ...prev, ...state })
    ),

    reset: () => {
        set({ user: undefined })
    }
}))