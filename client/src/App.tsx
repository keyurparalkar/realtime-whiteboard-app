import { useEffect, useState } from "react";
import "./App.css";
import BoardExample from "./Board";
import Peer from "peerjs";

function App() {
	const [id, setId] = useState<string | null>(null);
	const [peerCon, setPeerCon] = useState(null);

	// useEffect(() => {
	// 	const peer = new Peer();
	// }, [])

	const handleClick = async () => {
		const peer = new Peer();
		const id = await peer.id;
		if (peer.id) {
			setId(peer.id);
		} else {
			setId("no id");
		}
	};

	return (
		<>
			<h1>Live Cursor Example</h1>
			<span>id: {id}</span>
			<button onClick={handleClick}>start</button>
		</>
	);
}

export default App;
