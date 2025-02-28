import { useEffect, useRef, useState } from 'react';

type FftSize =
    | 32
    | 64
    | 128
    | 256
    | 512
    | 1024
    | 2048
    | 4096
    | 8192
    | 16384
    | 32768;

export function useAudio() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    const startAnalyzing = (source: MediaStream, fftSize: FftSize = 1024) => {
        if (!source) return;

        // Initialize AudioContext and AnalyserNode
        const audioContext = new AudioContext();
        const analyser = new AnalyserNode(audioContext, { fftSize });
        const audioSource = audioContext.createMediaStreamSource(source);

        audioSource.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Store references
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const update = () => {
            if (!analyser) return;

            analyser.getByteTimeDomainData(dataArray);

            const sum = dataArray.reduce((a, b) => a + b, 0);

            if (sum / dataArray.length / 128.0 >= 1) {
                setIsSpeaking(true);
                setTimeout(() => setIsSpeaking(false), 1000);
            }

            animationFrameIdRef.current = requestAnimationFrame(update);
        };

        update();
    };

    const stopAnalyzing = () => {
        // Cancel animation frame
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);

        // Disconnect and clean up audio resources
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();

        analyserRef.current = null;
        audioContextRef.current = null;
        setIsSpeaking(false);
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            stopAnalyzing();
        };
    }, []);

    return {
        isSpeaking,
        startAnalyzing,
        stopAnalyzing,
    };
}
