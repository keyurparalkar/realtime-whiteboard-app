import { ElementRef, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const STREAM_CONSTRAINTS = {
	video: true,
};

const PEER_CONNECTION_CONFIG = {
	iceServers: [
		{ urls: "stun:stun.services.mozilla.com" },
		{ urls: "stun:stun.l.google.com:19302" },
	],
};

type ConnectionInventory = {
	isPolite: boolean;
	clients: Record<string, RTCPeerConnection>;
};

const Client = () => {
	const connections = useRef<ConnectionInventory | null>(null);
	// const currentConnection = useRef<RTCPeerConnection>(null);

	const localVideoRef = useRef<ElementRef<"video">>(null);
	const remoteStreamRefs = useRef<ElementRef<"div">>(null);

	const makingOffer = useRef(false);
	const ignoreOffer = useRef(false);
	// const polite = useRef(false);

	const start = async (pc: RTCPeerConnection) => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia(
				STREAM_CONSTRAINTS
			);

			for (const track of mediaStream.getTracks()) {
				pc.addTrack(track, mediaStream);
			}

			if (localVideoRef.current) {
				localVideoRef.current.srcObject = mediaStream;
			}
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		const socket = io("http://localhost:3000");
		socket.connect();

		// const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);

		// start(pc);

		// pc.ontrack = (e) => {
		// 	const { streams } = e;
		// 	console.log({ ontrack: e });
		// 	if (remoteVideoRef.current) {
		// 		if (remoteVideoRef.current.srcObject) {
		// 			return;
		// 		} else {
		// 			remoteVideoRef.current.srcObject = streams[0];
		// 		}
		// 	}
		// };

		// pc.onnegotiationneeded = async () => {
		// 	try {
		// 		makingOffer.current = true;
		// 		// if (pc.signalingState !== "stable") {
		// 		// 	return;
		// 		// }
		// 		await pc.setLocalDescription();
		// 		socket.emit("signal", {
		// 			description: pc.localDescription,
		// 		});
		// 	} catch (error) {
		// 		console.error(error);
		// 	} finally {
		// 		makingOffer.current = false;
		// 	}
		// };

		// pc.onicecandidate = ({ candidate }) => socket.emit("signal", { candidate });

		socket.on("signal", async (socketId, data) => {
			const { description, candidate } = data;

			try {
				if (connections.current) {
					const currentPeer = connections.current.clients[socketId];

					if (description) {
						const offerCollision =
							description.type === "offer" &&
							(makingOffer.current || currentPeer.signalingState !== "stable");

						ignoreOffer.current =
							!connections.current.isPolite && offerCollision;

						if (ignoreOffer.current) {
							return;
						}

						await currentPeer.setRemoteDescription(description);

						if (description.type === "offer") {
							await currentPeer.setLocalDescription();
							socket.emit("signal", socketId, {
								description: currentPeer.localDescription,
							});
						}
					} else if (candidate) {
						try {
							await currentPeer.addIceCandidate(candidate);
						} catch (err) {
							if (!ignoreOffer.current) {
								throw err;
							}
						}
					}

					connections.current.clients[socketId] = currentPeer;
				}

				console.log({ coonn: connections.current });
			} catch (err) {
				console.error("Error occurred see below");
				console.table([socketId, description, err.message]);
			}
		});

		socket.on("user-joined", (isPolite: boolean, newSocketId: string) => {
			// if (count === 1) {
			// 	polite.current = true;
			// }

			// console.log("polite = ", polite.current);

			/**
			 * If new user joins,
			 * - we create RTC peer conn.
			 * - store it in connetions
			 */

			console.log({ isPolite, newSocketId });

			const peerConn = new RTCPeerConnection(PEER_CONNECTION_CONFIG);

			connections.current = {
				isPolite,
				clients: {
					...connections.current?.clients,
					[newSocketId]: peerConn,
				},
			};

			start(peerConn);

			peerConn.ontrack = (e) => {
				const { streams } = e;
				console.log({ ontrack: e });

				if (remoteStreamRefs.current) {
					const newVideo = document.createElement("video");
					newVideo.width = 400;
					newVideo.height = 300;
					newVideo.autoplay = true;
					newVideo.srcObject = streams[0];

					remoteStreamRefs.current?.appendChild(newVideo);
				}
			};

			peerConn.onnegotiationneeded = async () => {
				try {
					makingOffer.current = true;
					await peerConn.setLocalDescription();
					socket.emit("signal", newSocketId, {
						description: peerConn.localDescription,
					});
				} catch (error) {
					console.error(error);
				} finally {
					makingOffer.current = false;
				}
			};

			peerConn.onicecandidate = ({ candidate }) =>
				socket.emit("signal", newSocketId, { candidate });
		});
	}, []);

	return (
		<div id="container">
			<video
				id="local-stream"
				width={400}
				height={300}
				autoPlay={true}
				ref={localVideoRef}
			/>
			<div id="remote-streams" ref={remoteStreamRefs}></div>
		</div>
	);
};

export default Client;
