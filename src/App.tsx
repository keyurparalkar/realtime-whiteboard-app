import React, { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeChannel, createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

import "./App.css";
import Cursor from "./components/Cursor";
import StickyNote from "./components/StickyNote";
import { Clients, EventTypes } from "./types";
import { DEFAULT_NOTE, SUPABASE_KEY, SUPABASE_URL } from "./constants";
import { throttle } from "./utils";

const CURRENT_CLIENT_ID = nanoid();

const clientA = createClient(SUPABASE_URL, SUPABASE_KEY);
const channel = clientA.channel("room-1");

const throttledChannelTrack = throttle(channel, channel.track);

function App() {
	const [newClients, setNewClients] = useState<Clients>({});
	const subsChannel = useRef<RealtimeChannel | null>(null);
	const isFirstRender = useRef(true);

	const removeClient = useCallback(
		(clientId: string) => {
			const clients = { ...newClients };
			delete clients[clientId];

			setNewClients(clients);
		},
		[newClients]
	);

	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		throttledChannelTrack({
			[CURRENT_CLIENT_ID]: {
				...newClients[CURRENT_CLIENT_ID],
				eventType: EventTypes.MOVE_MOUSE,
				x: event.clientX,
				y: event.clientY,
			},
		});
	};

	const handleNoteAddition = () => {
		// We want to add notes immediately, hence not using throttled version of track():
		subsChannel.current?.track?.({
			[CURRENT_CLIENT_ID]: {
				...newClients[CURRENT_CLIENT_ID],
				eventType: EventTypes.ADD_NOTE,
				notes: [DEFAULT_NOTE],
			},
		});
	};

	useEffect(() => {
		channel.on("presence", { event: "sync" }, () => {
			const newState = channel.presenceState<Clients>();

			const presenceValues: Clients = {};

			Object.keys(newState).forEach((stateId) => {
				const presenceValue = newState[stateId][0];
				const clientId = Object.keys(presenceValue)[0];

				presenceValues[clientId] = presenceValue[clientId];
			});

			setNewClients((preValue) => {
				const updatedClients = Object.keys(presenceValues).reduce<Clients>(
					(acc, curr) => {
						acc[curr] = {
							...preValue[curr],
							...presenceValues[curr],
						};
						return acc;
					},
					{}
				);

				return updatedClients;
			});
		});
	}, []);

	useEffect(() => {
		if (isFirstRender.current) {
			subsChannel.current = channel.subscribe(async (status) => {
				if (status !== "SUBSCRIBED") return;
			});
			isFirstRender.current = false;
		}
	}, []);

	useEffect(() => {
		channel.on<{ clientId: string }>(
			"presence",
			{ event: "leave" },
			({ leftPresences }) => {
				const { clientId } = leftPresences[0];
				removeClient(clientId);
			}
		);
	}, [removeClient]);

	return (
		<div id="container" onMouseMove={handleMouseMove}>
			<button onClick={handleNoteAddition}>Add Note</button>
			<h1>Live Cursor Example</h1>
			<span>{JSON.stringify(newClients, null, 2)}</span>
			{Object.keys(newClients).map((clientId) => {
				const clientNotes = newClients[clientId].notes;

				return (
					<>
						<Cursor key={clientId} {...newClients[clientId]} />
						{clientNotes?.map((note, index) => (
							<StickyNote
								key={`note-${clientId}-${index}`}
								$x={note.x}
								$y={note.y}
								$noteText={note.content}
							/>
						))}
					</>
				);
			})}
		</div>
	);
}

export default App;
