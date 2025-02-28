import { create } from 'zustand';
import { merge, omit } from 'lodash';

export interface AppState {
    initialize: boolean
    loading?: boolean
    message?: string
}

export interface AppStore extends AppState {
    init: () => void
    set: (state: Partial<AppState>) => void
    reset: () => void
}

const key = "apps.settings";

const getStorages = (): Partial<AppState> => {
    const storage = localStorage.getItem(key);
    return storage ? JSON.parse(storage) : {};
}

export const useAppStore = create<AppStore>((setter) => ({
    initialize: false,
    loading: false,

    init: () => setter((state) => {
        if (!state.initialize) {
            state = {
                ...state,
                ...getStorages(),
                initialize: true
            }
        }
        return state
    }),

    set: (state) => {
        state = merge({}, getStorages(), state);

        localStorage.setItem(key, JSON.stringify(
            omit(state, 'initialize', 'loading', 'message')
        ));

        setter(state)
    },

    reset: () => {
        setter({})
        localStorage.removeItem(key)
    }
}))