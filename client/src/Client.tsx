import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const STREAM_CONSTRAINTS = {
	video: true,
};

const Client = () => {
	const connections = useRef<Record<string, RTCPeerConnection>>({});
	const offers = useRef<Record<string, RTCSessionDescription | null>>({});

	useEffect(() => {
		(async () => {
			const mediaStream = await navigator.mediaDevices.getUserMedia(
				STREAM_CONSTRAINTS
			);

			if (mediaStream) {
				const socket = io("http://localhost:3000");
				socket.connect();

				socket.on("new-user", async (socketIds: string[]) => {
					const externalSocketsIds = socketIds.filter((id) => id !== socket.id);
					// console.log({ externalSocketsIds });

					// create offer and set the SDP to signalling server
					for (const socketId of externalSocketsIds) {
						if (!(socketId in connections.current)) {
							connections.current[socketId] = new RTCPeerConnection({});
						}

						// create offer:
						const offer = await connections.current[socketId].createOffer();
						await connections.current[socketId].setLocalDescription(offer);
						offers.current[socketId] =
							connections.current[socketId].localDescription;
					}

					// console.log(`Created offer = `, offers.current);
					socket.emit("client-offers", offers.current);
				});

				socket.on("external-offer", (socketId, offer) => {
					console.log(
						`Recieved offer ${JSON.stringify(
							offer
						)} for ${socketId} current SocketId = ${socket.id}`
					);
				});
			}
		})();
	}, []);

	return (
		<div id="container">
			<video id="local-stream" width={400} height={300} autoPlay={true} />
			<div id="remote-streams"></div>
		</div>
	);
};

export default Client;
