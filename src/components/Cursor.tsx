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

	& span {
		color: white;
		background-color: red;
		padding: 0.3rem;
		border-radius: 1rem;
		font-size: 14px;
		font-weight: bold;
	}
`;

const Cursor = (props: CursorProps) => {
	const { x, y } = props;

	return (
		<StyledCursor id="cursor" x={x} y={y}>
			<svg viewBox="0 0 50 50">
				<polyline points="10,50 0,0 50,25 20,25" fill="red" />
			</svg>
			<span id="cursor-text">User1</span>
		</StyledCursor>
	);
};

export default Cursor;
