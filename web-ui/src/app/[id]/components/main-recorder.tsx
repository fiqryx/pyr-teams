'use client'
import React from "react";
import html2canvas from "html2canvas";

import { Button } from "@/components/ui/button";
import { useReaction } from "@/components/reaction";

const reactions = ['💖', '👍', '🎉', '👏', '😂', '😯', '😥', '🤔', '👎']

const DomRecorder = () => {
    const { showReaction } = useReaction()

    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const [recording, setRecording] = React.useState(false);
    const [videoURL, setVideoURL] = React.useState<string | null>(null);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        // Set up the canvas with correct dimensions
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }

        const interval = setInterval(handleShowReaction, 200);

        return () => {
            clearInterval(interval)
        }
    }, []);

    const handleShowReaction = () => {
        const randomEmoji = reactions[Math.floor(Math.random() * reactions.length)];
        showReaction(randomEmoji);
    };

    const startRecording = async () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const stream = canvas.captureStream(30); // 30 FPS

        const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });

        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
            if (chunks.length === 0) {
                console.log("Recording failed: No data chunks available.");
                return;
            }
            const blob = new Blob(chunks, { type: "video/webm" });
            setVideoURL(URL.createObjectURL(blob));
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setRecording(true);

        // Capture the DOM every 33ms (~30 FPS)
        intervalRef.current = setInterval(async () => {
            if (!ctx) return;
            const screenshot = await html2canvas(document.body);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(screenshot, 0, 0, canvas.width, canvas.height);
        }, 33);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setRecording(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col xmin-h-screen gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleShowReaction}>
                    Show Reaction
                </Button>
                <Button onClick={startRecording} disabled={recording}>
                    Start Recording
                </Button>
                <Button onClick={stopRecording} disabled={!recording}>
                    Stop Recording
                </Button>
            </div>
            {/* Show canvas for debugging */}
            <canvas ref={canvasRef} className="hidden bg-transparent w-full h-auto" />

            {videoURL && (
                <div>
                    <h3>Recorded Video:</h3>
                    <video controls src={videoURL} />
                </div>
            )}
        </div>
    );
};

export default DomRecorder;
