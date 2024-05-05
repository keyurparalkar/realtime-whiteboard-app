import React, { ElementRef, useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
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
	allowUserUpdates: boolean;
	color: string;
	clientName: string;
	handleNoteMouseMove: (currentNote: Note, noteIndex: number) => void;
	handleNoteTextChange: (text: string, noteIndex: number) => void;
};

type StyledNoteProps = {
	$allowTransition: boolean;
	$borderColor: string;
};

/**
 * $allowTransition - Flag that adds the transition CSS property.
 * We want the other user to have smooth movement of note when the current user drags his note with the mouse.
 * For this to work, we enable transition property of all the clients except for the current client which is dragging the note.
 */
const StyledNote = styled.div<StyledNoteProps>`
	${(props) =>
		!props.$allowTransition &&
		css`
			transition: all 1s ease-in-out;
			outline: 5px solid ${props.$borderColor || "pink"};
			&:hover {
				& #user-tag {
					visibility: visible;
				}
			}
		`}
	position: absolute;
	width: 300px;
	height: 200px;
	background-color: #c7c242;
	color: black;
	font-weight: 500;
	font-size: 2rem;
	transform: translate(-150px, -100px);
`;

const StyledUserTag = styled.div<{ $bgColor: string }>`
	visibility: hidden;

	position: absolute;
	left: 68%;
	top: -19%;
	width: 100px;
	height: 30px;
	background-color: ${(props) => props.$bgColor || "pink"};

	color: white;
	font-weight: 800;
	font-size: 1rem;
`;

const StyledTextArea = styled.textarea`
	width: 85%;
	margin: 1rem;
	border: none;
	background: transparent;

	font-size: 1rem;
	font-weight: 600;
`;

const StickyNote = (props: StickyNoteProps) => {
	const {
		noteText,
		$x,
		$y,
		noteIndex,
		allowUserUpdates,
		color,
		clientName,
		handleNoteMouseMove,
		handleNoteTextChange,
	} = props;

	const [text, setText] = useState("");
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);
	const isMouseDown = useRef(false);
	const textAreaRef = useRef<ElementRef<"textarea">>(null);

	const handleClick = () => {
		if (textAreaRef.current) {
			textAreaRef.current.blur();
		}
	};

	const handleDoubleClick = () => {
		if (textAreaRef.current) {
			textAreaRef.current.focus();
		}
	};

	const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setText(event.currentTarget.value || "");
		handleNoteTextChange(event.currentTarget.value || "", noteIndex);
	};

	const handleMouseDown = () => {
		isMouseDown.current = true;
	};

	const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
		// prevent other clients to move the note of the current client
		if (isMouseDown.current && allowUserUpdates) {
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

	useEffect(() => {
		setText(noteText);
	}, [noteText]);

	return (
		<StyledNote
			id="sticky-note"
			$allowTransition={allowUserUpdates}
			$borderColor={color}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			style={{ top: y, left: x }}
		>
			<StyledUserTag id="user-tag" $bgColor={color}>
				user-{clientName}
			</StyledUserTag>
			<StyledTextArea
				id="editable-text-area"
				rows={8}
				onChange={handleOnChange}
				onClick={handleClick}
				onDoubleClick={handleDoubleClick}
				ref={textAreaRef}
				value={text}
			></StyledTextArea>
		</StyledNote>
	);
};

export default StickyNote;
