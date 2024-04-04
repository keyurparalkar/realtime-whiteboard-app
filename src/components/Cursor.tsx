import styled from "styled-components";

type CursorProps = {
	x: number;
	y: number;
};

const StyledCursor = styled.div<CursorProps>`
	transition: all 0.5s ease-in-out;
	display: inline-block;
	width: 20px;
	height: 20px;
	position: absolute;
	top: ${(props) => props.y}px;
	left: ${(props) => props.x}px;
	background-color: red;
`;

const Cursor = (props: CursorProps) => {
	const { x, y } = props;

	return <StyledCursor id="cursor" x={x} y={y} />;
};

export default Cursor;
