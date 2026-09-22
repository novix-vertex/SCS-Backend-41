import {
    FaceLandmarker,
    FilesetResolver
} from "@mediapipe/tasks-vision";

import {
    useEffect,
    useRef,
    useState
} from "react";


const Camera = () => {

    const videoRef = useRef(null);
    const landmarkerRef = useRef(null);
    const animationRef = useRef(null);

    const [expression, setExpression] =
        useState("Starting...");


    const getScore = (categories, name) => {

        const item = categories?.find(
            item => item.categoryName === name
        );

        return item?.score || 0;
    };


    useEffect(() => {

        let stream = null;


        const createFaceDetector = async () => {

            try {

                console.log("Loading MediaPipe...");


                const vision =
                    await FilesetResolver.forVisionTasks(
                        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
                    );


                console.log("MediaPipe loaded");


                const landmarker =
                    await FaceLandmarker.createFromOptions(
                        vision,
                        {
                            baseOptions: {
                                modelAssetPath:
                                    "/models/face_landmarker.task"
                            },

                            runningMode: "VIDEO",

                            outputFaceBlendshapes: true
                        }
                    );


                landmarkerRef.current =
                    landmarker;


                console.log(
                    "Face Landmarker created"
                );

            } catch (error) {

                console.error(
                    "MediaPipe error:",
                    error
                );

            }

        };


        const startCamera = async () => {

            try {

                stream =
                    await navigator.mediaDevices
                        .getUserMedia({
                            video: true
                        });


                console.log(
                    "Camera stream created"
                );


                if (videoRef.current) {

                    videoRef.current.srcObject =
                        stream;

                }

            } catch (error) {

                console.error(
                    "Camera error:",
                    error
                );

            }

        };


        const detectFace = () => {

            if (
                !landmarkerRef.current ||
                !videoRef.current
            ) {

                animationRef.current =
                    requestAnimationFrame(
                        detectFace
                    );

                return;
            }


            if (
                videoRef.current.readyState < 2
            ) {

                animationRef.current =
                    requestAnimationFrame(
                        detectFace
                    );

                return;
            }


            const result =
                landmarkerRef.current
                    .detectForVideo(
                        videoRef.current,
                        performance.now()
                    );


            let expression = "Neutral";


            const categories =
                result.faceBlendshapes[0]?.categories;


            if (categories) {

                // Smile

                const smileLeft =
                    getScore(
                        categories,
                        "mouthSmileLeft"
                    );

                const smileRight =
                    getScore(
                        categories,
                        "mouthSmileRight"
                    );


                // Frown

                const frownLeft =
                    getScore(
                        categories,
                        "mouthFrownLeft"
                    );

                const frownRight =
                    getScore(
                        categories,
                        "mouthFrownRight"
                    );


                // Jaw

                const jawOpen =
                    getScore(
                        categories,
                        "jawOpen"
                    );


                // Brows down

                const browDownLeft =
                    getScore(
                        categories,
                        "browDownLeft"
                    );

                const browDownRight =
                    getScore(
                        categories,
                        "browDownRight"
                    );


                // Brows up

                const browUpLeft =
                    getScore(
                        categories,
                        "browOuterUpLeft"
                    );

                const browUpRight =
                    getScore(
                        categories,
                        "browOuterUpRight"
                    );


                // Calculate averages

                const smileScore =
                    (smileLeft + smileRight) / 2;


                const frownScore =
                    (frownLeft + frownRight) / 2;


                const browDownScore =
                    (browDownLeft + browDownRight) / 2;


                const browUpScore =
                    (browUpLeft + browUpRight) / 2;


                // Expression rules

                if (
                    jawOpen > 0.6 &&
                    browUpScore > 0.3
                ) {

                    expression =
                        "Surprised 😮";

                }
                else if (
                    smileScore > 0.5
                ) {

                    expression =
                        "Happy 🙂";

                }
                else if (
                    frownScore > 0.4
                ) {

                    expression =
                        "Sad 😢";

                }
                else if (
                    browDownScore > 0.5
                ) {

                    expression =
                        "Angry 😠";

                }

            }


            setExpression(expression);


            animationRef.current =
                requestAnimationFrame(
                    detectFace
                );

        };


        const setup = async () => {

            await createFaceDetector();

            await startCamera();

            console.log(
                "Starting face detection..."
            );

            detectFace();

        };


        setup();


        return () => {

            cancelAnimationFrame(
                animationRef.current
            );


            if (stream) {

                stream.getTracks().forEach(
                    track => track.stop()
                );

            }


            if (landmarkerRef.current) {

                landmarkerRef.current.close();

            }

        };

    }, []);


    return (

        <div>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                width="500"
            />


            <h2>
                Expression: {expression}
            </h2>

        </div>

    );

};


export default Camera;