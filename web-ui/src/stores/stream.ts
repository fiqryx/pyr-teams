import { create } from 'zustand';
import {
    Status,
    VideoCallback,
    ShareScreenOptions,
} from '@/types/stream';

export interface Stream {
    media: MediaStream | null;
    sharedScreen?: MediaStreamTrack
    audioTrack?: MediaStreamTrack
    fullscreen: boolean;
    muted: boolean;
    visible: boolean;
    status: Status;
    devices: MediaDeviceInfo[]
    microphone?: string
    speaker?: string
    camera?: string
    pictureInPicture: boolean
}

export interface StreamStore extends Stream {
    set: (state: Partial<Stream>) => void
    checkPermission: () => Promise<boolean>
    createStream: () => Promise<void>
    toggleMic: (enable?: boolean) => void
    turnOffCamera: () => void
    toggleCamera: (cb?: VideoCallback) => Promise<void>
    switchMic: (deviceId: string) => Promise<void>
    switchCamera: (deviceId: string) => Promise<void>
    startShareScreen: (options?: ShareScreenOptions) => Promise<void | boolean>
    stopShareScreen: (track?: MediaStreamTrack) => void
    toggleScreenAudio: (enable: boolean) => Promise<void>
    resetStream: VoidFunction
}

function createSilentStream() {
    const pc = new RTCPeerConnection();
    const track = pc.addTransceiver("video").receiver.track;

    track.enabled = false;
    track.stop()

    return new MediaStream([track])
}

const createStream = async (constraints?: MediaStreamConstraints) => {
    let audio: MediaStream | null = null;
    let video: MediaStream | null = null;

    try {
        audio = await navigator.mediaDevices.getUserMedia(
            { audio: constraints?.audio ?? true }
        );
    } catch (e) {
        console.warn("Audio permission denied", e);
    }

    try {
        video = await navigator.mediaDevices.getUserMedia(
            { video: constraints?.video ?? true }
        );
    } catch (e) {
        console.warn("Video permission denied", e);
    }

    if (!audio && !video) {
        return
    }

    return new MediaStream([
        ...(video ? video.getTracks() : []),
        ...(audio ? audio.getTracks() : []),
    ]);
}

export const useStream = create<StreamStore>((set, get) => ({
    media: null,
    muted: false,
    visible: true,
    fullscreen: false,
    status: 'loading',
    devices: [],
    pictureInPicture: false,

    set: (state) => set((prev) => ({ ...prev, ...state })),

    checkPermission: async () => {
        // @ts-ignore: Type 'name' is not assignable to type 'PermissionName'
        const mic = await navigator.permissions.query({ name: "microphone" })
        // @ts-ignore: Type 'name' is not assignable to type 'PermissionName'
        const cam = await navigator.permissions.query({ name: "camera" })

        return mic.state === 'granted' && cam.state === 'granted';
    },

    createStream: async () => {
        try {
            const { media: stream } = get()
            if (stream) return;

            const media = await createStream()

            if (!media) {
                throw new Error("Both audio and video permissions were denied.")
            }

            const [audio, video] = media.getTracks()
            const devices = await navigator.mediaDevices.enumerateDevices()

            set({
                media,
                devices,
                status: 'success',
                muted: !audio?.enabled,
                visible: video?.enabled,
                microphone: devices.find((device) => device.kind === 'audioinput')?.deviceId,
                speaker: devices.find((device) => device.kind === 'audiooutput')?.deviceId,
                camera: devices.find((device) => device.kind === 'videoinput')?.deviceId,
            });
        } catch (error) {
            set({ status: 'rejected', muted: true, visible: false });
            console.warn(error);
        }
    },

    toggleMic: (enable?: boolean) => {
        const { media, set } = get();
        if (!media) return;

        const track = media?.getTracks().find((v) => v.kind === 'audio');
        if (!track) {
            throw new Error(`Failed. Could not find audio track in the given stream`);
        }

        track.enabled = enable ?? !track.enabled;
        set({ muted: !track.enabled })
    },

    turnOffCamera: () => {
        const { media, set } = get();
        if (!media) return

        const videoTrack = media.getVideoTracks()[0];
        if (videoTrack?.readyState === 'live') {
            videoTrack.enabled = false;
            videoTrack.stop();
            set({ visible: false });
        }
    },

    toggleCamera: async (callback) => {
        try {
            const { media, set } = get();
            if (!media) return

            const videoTrack = media.getVideoTracks()[0];
            if (videoTrack?.readyState === 'live') {
                videoTrack.enabled = false;
                videoTrack.stop();
                set({ visible: false });
            } else {
                const newStream = await createStream()
                const video = newStream?.getVideoTracks()[0];

                if (!video) {
                    throw new Error("Permission denied");
                }

                if (callback) {
                    callback(video);
                }

                media.getVideoTracks().forEach(
                    (track) => media.removeTrack(track)
                );

                media.addTrack(video);
                set({ media, visible: true });
            }
        } catch (e) {
            console.error(e);
        }
    },

    switchMic: async (deviceId) => {
        try {
            const { media, set } = get()

            const stream = await createStream({
                audio: { deviceId: { exact: deviceId } },
                video: true,
            })

            media?.getTracks().forEach((track) => track.stop());
            set({ media: stream, microphone: deviceId });
        } catch (error) {
            console.error("Error switching microphone:", error);
        }
    },

    switchCamera: async (deviceId) => {
        try {
            const { media, set } = get()

            const stream = await createStream({
                audio: true,
                video: { deviceId: { exact: deviceId } },
            })

            media?.getTracks().forEach((track) => track.stop());
            set({ media: stream, camera: deviceId });
        } catch (error) {
            console.error("Error switching camera:", error)
        }
    },

    startShareScreen: async (options) => {
        try {
            const { media, set, stopShareScreen } = get()
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 60, max: 60 },
                    aspectRatio: 16 / 9,
                },
                audio: false,
            });

            stopShareScreen()
            const track = stream.getTracks()[0]
            set({ sharedScreen: track })

            if (media) {
                media.addTrack(track)
            } else {
                const media = createSilentStream()
                media.addTrack(track)
                set({ media })
            }

            if (options?.onStart) {
                options.onStart()
            }

            track.onended = () => {
                stopShareScreen(track)
                if (options?.onEnded) {
                    options.onEnded()
                }
            }

            return true
        } catch (error) {
            console.warn('Failed to share screen')
            if (options?.onError) {
                options.onError(error as string)
            }
        }
    },

    stopShareScreen: () => {
        const { media, sharedScreen, audioTrack, set } = get()
        if (sharedScreen) {
            sharedScreen.stop()
            audioTrack?.stop()
            media?.removeTrack(sharedScreen)
            set({ sharedScreen: undefined, fullscreen: false })
        }
    },

    toggleScreenAudio: async (enable: boolean) => {
        try {
            const { media, audioTrack, set } = get()
            if (enable) {
                if (audioTrack) return; // Already enabled

                const audioStream = await navigator.mediaDevices.getDisplayMedia({
                    video: false,
                    audio: { echoCancellation: true, noiseSuppression: true }
                });

                const track = audioStream.getAudioTracks()[0];

                set({ audioTrack: track })
                media?.addTrack(track);
            } else {
                if (audioTrack) {
                    media?.removeTrack(audioTrack);
                    audioTrack.stop();
                    set({ audioTrack: undefined })
                }
            }
        } catch (err) {
            console.warn("No system audio available:", err);
        }
    },

    resetStream: () => {
        const { media } = get();
        media?.getTracks().forEach(track => track.stop())

        set({
            media: null,
            muted: false,
            visible: true,
            fullscreen: false,
            sharedScreen: undefined,
            status: 'idle',
            devices: [],
        })
    }
}))