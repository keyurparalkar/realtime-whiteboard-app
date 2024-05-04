import React, { useRef, useState } from "react";
import styled from "styled-components";

type StickyNoteProps = {
	$noteText: string;
	$x: number;
	$y: number;
};

const StyledNote = styled.div<Omit<StickyNoteProps, "$noteText">>`
	position: absolute;
	top: ${(props) => props.$y}px;
	left: ${(props) => props.$x}px;
	width: 300px;
	height: 200px;
	background-color: #c7c242;
	color: black;
	font-weight: 500;
	font-size: 2rem;
	transform: translate(-150px, -100px);
`;

const StickyNote = (props: StickyNoteProps) => {
	const { $noteText, $x, $y } = props;
	const [text, setText] = useState($noteText || "");
	const [x, setX] = useState($x || 0);
	const [y, setY] = useState($y || 0);
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
		}
	};

	const handleMouseUp = () => {
		isMouseDown.current = false;
	};

	return (
		<StyledNote
			id="sticky-note"
			$x={x}
			$y={y}
			onInput={handleInput}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
		>
			{text}
		</StyledNote>
	);
};

export default StickyNote;
