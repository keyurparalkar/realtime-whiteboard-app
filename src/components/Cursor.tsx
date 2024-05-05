import styled from "styled-components";

type CursorProps = {
	x: number;
	y: number;
	color: string;
	clientName: string;
};

const StyledCursor = styled.div<Omit<CursorProps, "clientName">>`
	transition: all 0.5s ease-in-out;

	display: inline-block;
	width: 20px;
	height: 20px;
	position: absolute;
	top: ${(props) => props.y}px;
	left: ${(props) => props.x}px;

	& span {
		display: inline-block;
		width: 7em;
		border-radius: 1rem;
		padding: 0.3rem;
		background-color: ${(props) => props.color};

		font-size: 14px;
		color: white;
		font-weight: bold;
	}
`;

const Cursor = (props: CursorProps) => {
	const { x, y, color, clientName } = props;

	return (
		<StyledCursor id="cursor" x={x} y={y} color={color}>
			<svg viewBox="0 0 50 50">
				<polyline points="10,50 0,0 50,25 20,25" fill={color} />
			</svg>
			<span id="cursor-text">user-{clientName}</span>
		</StyledCursor>
	);
};

export default Cursor;
