import React, { useState } from "react";
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
`;

const StickyNote = (props: StickyNoteProps) => {
	const { $noteText, ...rest } = props;
	const [text, setText] = useState($noteText || "");

	const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
		setText(event.currentTarget.textContent || "");
	};

	return (
		<StyledNote id="sticky-note" onInput={handleInput} {...rest}>
			{text}
		</StyledNote>
	);
};

export default StickyNote;
