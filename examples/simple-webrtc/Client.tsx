import React, { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeChannel, createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import styled from "styled-components";

import Cursor from "./components/Cursor";
import StickyNote from "./components/StickyNote";
import { Clients, EventTypes, Note } from "./types";
import { DEFAULT_NOTE, SUPABASE_KEY, SUPABASE_URL } from "./constants";
import { throttle } from "./utils";
import "./App.css";

const randomNumber = Math.trunc(Math.random() * 100);
const randomColor = `rgb(${randomNumber}%, 30%, 40%)`;

const CURRENT_CLIENT_ID = nanoid();

const clientA = createClient(SUPABASE_URL, SUPABASE_KEY);
const channel = clientA.channel("room-1");

const throttledChannelTrack = throttle(channel, channel.track);

const StyledContainer = styled.div`
	& #navbar {
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: 0.05fr 0.05fr 1fr 0.1fr;
	}

	& button {
		height: 30px;
		margin-top: 1rem;
	}
`;

function App() {
	const [newClients, setNewClients] = useState<Clients>({});
	const [enableLogs, setEnableLogs] = useState(false);
	const subsChannel = useRef<RealtimeChannel | null>(null);
	const isFirstRender = useRef(true);

	const toggleLogs = () => {
		setEnableLogs(!enableLogs);
	};

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
				color: randomColor,
				x: event.clientX,
				y: event.clientY,
			},
		});
	};

	const handleNoteAddition = () => {
		const currentClient = newClients[CURRENT_CLIENT_ID];

		// We want to add notes immediately, hence not using throttled version of track():
		subsChannel.current?.track?.({
			[CURRENT_CLIENT_ID]: {
				...currentClient,
				eventType: EventTypes.ADD_NOTE,
				notes: currentClient.notes
					? [...currentClient.notes, DEFAULT_NOTE]
					: [DEFAULT_NOTE],
			},
		});
	};

	const handleNoteMouseMove = (currentNote: Note, noteIndex: number) => {
		const currentClient = newClients[CURRENT_CLIENT_ID];

		const notes = currentClient.notes;
		notes[noteIndex] = currentNote;

		throttledChannelTrack({
			[CURRENT_CLIENT_ID]: {
				...currentClient,
				eventType: EventTypes.MOVE_NOTE,
				notes,
			},
		});
	};

	const handleNoteTextChange = (text: string, noteIndex: number) => {
		const currentClient = newClients[CURRENT_CLIENT_ID];

		const notes = currentClient.notes;
		notes[noteIndex].content = text;

		throttledChannelTrack({
			[CURRENT_CLIENT_ID]: {
				...currentClient,
				eventType: EventTypes.ADD_NOTE_TEXT,
				notes,
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
		<StyledContainer id="container" onMouseMove={handleMouseMove}>
			<div id="info-container">
				<div id="navbar">
					<button onClick={handleNoteAddition}>Add Note</button>
					<button onClick={toggleLogs}>Enable Logs</button>
					<h1>Live Cursor Example</h1>
				</div>
				<h2>Client: {CURRENT_CLIENT_ID.substring(0, 4)}</h2>
				{enableLogs && <span>{JSON.stringify(newClients, null, 2)}</span>}
			</div>
			{Object.keys(newClients).map((clientId) => {
				const currentClientName = clientId.substring(0, 4);

				const currentClient = newClients[clientId];
				const clientNotes = currentClient.notes;

				// Only the current client can make updates to the note.
				const allowUserUpdates = clientId === CURRENT_CLIENT_ID;

				return (
					<div key={`container-${clientId}`}>
						{clientId !== CURRENT_CLIENT_ID && (
							<Cursor
								key={clientId}
								x={currentClient.x}
								y={currentClient.y}
								color={currentClient.color}
								clientName={currentClientName}
							/>
						)}
						{clientNotes?.map((note, index) => (
							<StickyNote
								key={`note-${clientId}-${index}`}
								$x={note.x}
								$y={note.y}
								color={currentClient.color}
								clientName={currentClientName}
								noteText={note.content}
								noteIndex={index}
								allowUserUpdates={allowUserUpdates}
								handleNoteMouseMove={handleNoteMouseMove}
								handleNoteTextChange={handleNoteTextChange}
							/>
						))}
					</div>
				);
			})}
		</StyledContainer>
	);
}

export default App;
