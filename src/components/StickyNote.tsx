import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Note } from "../types";

/**
 * - noteText: The content of the note
 * - x, y: Top and left of the note from the viewport. This is usually clientX and clientY.
 * - noteIndex: Index of the current note of the client. Each client can have multiple notes
 * - allowUserUpdates: A flag that tells whether the current user can edit/move the note.
 * - handleNoteMouseMove: Function that handles the dragging of the note.
 */

type StickyNoteProps = {
	noteText: string;
	$x: number;
	$y: number;
	noteIndex: number;
	handleNoteMouseMove: (currentNote: Note, noteIndex: number) => void;
	allowUserUpdates: boolean;
};

type StyledNoteProps = {
	$allowTransition: boolean;
};

/**
 * $allowTransition - Flag that adds the transition CSS property.
 * We want the other user to have smooth movement of note when the current user drags his note with the mouse.
 * For this to work, we enable transition property of all the clients except for the current client which is dragging the note.
 */
const StyledNote = styled.div<StyledNoteProps>`
	${(props) => !props.$allowTransition && `transition: all 1s ease-in-out;`}
	position: absolute;
	width: 300px;
	height: 200px;
	background-color: #c7c242;
	color: black;
	font-weight: 500;
	font-size: 2rem;
	transform: translate(-150px, -100px);
`;

const StickyNote = (props: StickyNoteProps) => {
	const { noteText, $x, $y, handleNoteMouseMove, noteIndex, allowUserUpdates } =
		props;

	const [text, setText] = useState(noteText || "");
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);
	const isMouseDown = useRef(false);

	const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
		setText(event.currentTarget.textContent || "");
	};

	const handleMouseDown = () => {
		isMouseDown.current = true;
	};

	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		if (isMouseDown.current) {
			setX(event.clientX);
			setY(event.clientY);
			const currentNote: Note = {
				x: event.clientX,
				y: event.clientY,
				content: noteText,
			};
			handleNoteMouseMove(currentNote, noteIndex);
		}
	};

	const handleMouseUp = () => {
		isMouseDown.current = false;
	};

	useEffect(() => {
		setX($x);
		setY($y);
	}, [$x, $y]);

	return (
		<StyledNote
			id="sticky-note"
			$allowTransition={allowUserUpdates}
			onInput={handleInput}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			style={{ top: y, left: x }}
		>
			{text}
		</StyledNote>
	);
};

export default StickyNote;
