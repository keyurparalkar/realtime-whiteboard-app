import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import "./App.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Cursor from "./components/Cursor";

type Payload = {
	clientId: string;
	x: number;
	y: number;
};

type Clients = Record<string, Omit<Payload, "clientId">>;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const CURRENT_CLIENT_ID = nanoid();

const clientA = createClient(SUPABASE_URL, SUPABASE_KEY);
const channel = clientA.channel("room-1");

const throttle = <ArgType,>(
	instance: unknown,
	func: (args: ArgType) => unknown,
	delay: number = 2000
) => {
	let flag: NodeJS.Timeout | null = null;
	const _this = instance;

	return (args: ArgType) => {
		if (flag === null) {
			func.call(_this, args);
			flag = setTimeout(() => {
				flag = null;
			}, delay);
		}
	};
};

const func = throttle(channel, channel.send);

function App() {
	const [newClients, setNewClients] = useState<Clients>({});
	const isFirstRender = useRef(true);

	const sendBroadcast = (payload: Payload) => {
		const { clientId, x, y } = payload;

		setNewClients((preVal) => ({
			...preVal,
			[clientId]: {
				x,
				y,
			},
		}));
	};

	const removeClient = useCallback(
		(clientId: string) => {
			console.log({ newClients });
			const clients = { ...newClients };
			delete clients[clientId];

			setNewClients(clients);
		},
		[newClients]
	);

	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		func({
			type: "broadcast",
			event: "test",
			payload: {
				clientId: CURRENT_CLIENT_ID,
				x: event.clientX,
				y: event.clientY,
			},
		});
	};

	useEffect(() => {
		channel
			.on("presence", { event: "sync" }, () => {
				const newState = channel.presenceState();
				console.log("sync = ", newState);
			})
			.on(
				"broadcast",
				{ event: "test" },
				(log: { type: "broadcast"; event: string; payload: Payload }) =>
					sendBroadcast(log.payload)
			);
	}, []);

	useEffect(() => {
		channel.on<{ clientId: string }>(
			"presence",
			{ event: "leave" },
			({ key, leftPresences }) => {
				console.log("leave", key, leftPresences);

				const { clientId } = leftPresences[0];
				console.log("newClients in effect = ", newClients);
				removeClient(clientId);
			}
		);
	}, [newClients, removeClient]);

	useEffect(() => {
		if (isFirstRender.current) {
			channel.subscribe(async (status) => {
				if (status !== "SUBSCRIBED") return;

				await channel.track({
					clientId: CURRENT_CLIENT_ID,
				});
			});
			isFirstRender.current = false;
		}
	}, []);

	return (
		<div id="container" onMouseMove={handleMouseMove}>
			<h1>Live Cursor Example</h1>
			<span>{JSON.stringify(newClients, null, 2)}</span>
			{Object.keys(newClients).map((clientId) => (
				<Cursor key={clientId} {...newClients[clientId]} />
			))}
		</div>
	);
}

export default App;
