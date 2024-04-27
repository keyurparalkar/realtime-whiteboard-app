import { ElementRef, useEffect, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

const peerConnectionConfig = {
	iceServers: [
		{ urls: "stun:stun.services.mozilla.com" },
		{ urls: "stun:stun.l.google.com:19302" },
	],
};

/**
 * Program flow:
 * 1. On page load, permission should be asked to access the video camera.
 * 2. Once given, the video element should be shown in the component.
 * 3. Then create RTCPeerConnection based on the given id
 */

function App() {
	const videoRef = useRef<ElementRef<"video">>(null);

	const connections = useRef<Record<string, RTCPeerConnection>>({});

	useEffect(() => {
		(async () => {
			try {
				// This will load the current client video
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					audio: false,
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

				if (mediaStream) {
					const socket = io("http://localhost:3000");

					socket.on("init", async (fromId, msg) => {
						// console.log("Init handler = ", {
						// 	// fromId,
						// 	// socketId: socket.id,
						// 	// msg,
						// 	connections: connections.current,
						// });

						if (socket.id && msg.ansSdp) {
							console.log("Inside AnsSDP");
							await connections.current[socket.id].setRemoteDescription(
								msg.ansSdp
							);
						}

						if (fromId !== socket.id) {
							if (msg.sdp) {
								await connections.current[fromId].setRemoteDescription(msg.sdp);

								const answer = await connections.current[fromId].createAnswer();
								await connections.current[fromId].setLocalDescription(answer);
								console.log(
									`created answer for fromId: ${fromId} with current Socket.id: ${socket.id}`
								);
								socket.emit("init", socket.id, {
									ansSdp: connections.current[fromId].localDescription,
								});
							}

							if (msg.ice) {
								const candidate = new RTCIceCandidate(msg.ice);

								connections.current[fromId].addIceCandidate(candidate);
							}
						}
					});

					socket.on(
						"new-user",
						async (fromId: string, count: number, allClientIds: string[]) => {
							console.log("new-user = ", { fromId, count, allClientIds });
							console.log(
								"connections in new-user event = ",
								connections.current
							);

							if (connections.current && allClientIds) {
								allClientIds.forEach((clientId) => {
									if (!(clientId in connections.current)) {
										connections.current[clientId] = new RTCPeerConnection(
											peerConnectionConfig
										);

										connections.current[clientId].onicecandidate = (
											event: RTCPeerConnectionIceEvent
										) => {
											if (event.candidate !== null) {
												socket.emit("init", clientId, { ice: event.candidate });
											}
										};

										connections.current[clientId].ontrack = async (
											e: RTCTrackEvent
										) => {
											const newVideo = document.createElement("video");
											newVideo.setAttribute("data-socketid", clientId);
											newVideo.width = 400;
											newVideo.height = 300;
											newVideo.autoplay = true;
											newVideo.srcObject = e.streams[0];

											const remoteVideoSlot =
												document.querySelector("#remote-conn");

											remoteVideoSlot?.appendChild(newVideo);
										};

										for (const track of mediaStream.getTracks()) {
											connections.current[clientId].addTrack(
												track,
												mediaStream
											);
										}
									}
								});
							}

							if (count >= 2) {
								const offer = await connections.current[fromId].createOffer();
								await connections.current[fromId].setLocalDescription(offer);
								socket.emit("init", fromId, {
									sdp: connections.current[fromId].localDescription,
								});
							}
						}
					);
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
			<div id="remote-conn"></div>
		</>
	);
}

export default App;
