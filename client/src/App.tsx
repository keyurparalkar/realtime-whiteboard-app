import { ElementRef, useEffect, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

/**
 * Program flow:
 * 1. On page load, permission should be asked to access the video camera.
 * 2. Once given, the video element should be shown in the component.
 */

function App() {
	const videoRef = useRef<ElementRef<"video">>(null);

	useEffect(() => {
		const socket = io("http://localhost:3000");

		socket.on("new-user", (id: string, count: number) => {
			console.log({ id, count });
		});
	}, []);

	useEffect(() => {
		(async () => {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: {
						width: 400,
						height: 300,
					},
				});

				const video = videoRef.current;
				if (video) {
					video.srcObject = mediaStream;
					video.play();
				}
			} catch (err) {
				console.log({ err });
			}
		})();
	}, []);

	return (
		<>
			<h1>Live Cursor Example</h1>
			<video width={400} height={300} ref={videoRef} />
		</>
	);
}

export default App;
