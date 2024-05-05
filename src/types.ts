export enum EventTypes {
	MOVE_MOUSE = "move-mouse",
	MOVE_NOTE = "move-note",
	ADD_NOTE = "add-note",
}

export type Note = {
	x: number;
	y: number;
	content: string;
};

type Payload = {
	eventType: EventTypes;
	x: number;
	y: number;
	color: string;
	notes: Array<Note>;
};

export type Clients = Record<string, Payload>;
