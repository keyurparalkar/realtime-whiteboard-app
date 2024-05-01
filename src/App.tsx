import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Cursor from "./components/Cursor";

type Payload = {
	clientId: string;
	x: number;
	y: number;
};

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
	const [newClients, setNewClients] = useState<
		Record<string, { x: number; y: number }>
	>({});
	const isFirstRender = useRef(true);

	const logger = (payload: Payload) => {
		const { clientId, x, y } = payload;

		setNewClients((preVal) => ({
			...preVal,
			[clientId]: {
				x,
				y,
			},
		}));
	};

	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
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
		if (isFirstRender.current) {
			channel
				.on(
					"broadcast",
					{ event: "test" },
					(log: { type: "broadcast"; event: string; payload: Payload }) =>
						logger(log.payload)
				)
				.subscribe((status) => {
					if (status !== "SUBSCRIBED") {
						return null;
					}
				});

			isFirstRender.current = false;
		}
	}, []);

	return (
		<div id="container" onMouseMove={handleClick}>
			<h1>Live Cursor Example</h1>
			<span>{JSON.stringify(newClients, null, 2)}</span>
			{Object.keys(newClients).map((clientId) => (
				<Cursor key={clientId} {...newClients[clientId]} />
			))}
		</div>
	);
}

export default App;
