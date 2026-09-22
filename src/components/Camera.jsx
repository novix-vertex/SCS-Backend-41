import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react"

const Camera = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        const startCamera = async () => {
            let stream = null;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });

                console.log("Camera stream:", stream);
                console.log("Is MediaStream:", stream instanceof MediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

            } catch (error) {
                console.error("Camera error:", error);
            }

            videoRef.current.srcObject = stream;

        }

        const createFaceDetector = async () => {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm")

            const detector = await FaceDetector.createFromOptions(
                vision,
                {
                    baseOptions: {
                        modelAssetPath: "/models/blaze_face_short_range.tflite"
                    },
                    runningMode: "VIDEO"
                }
            );
            console.log("Face detector created", detector);

        }

        startCamera();
        createFaceDetector();

    }, [])
    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width="500" />

    )
}

export default Camera