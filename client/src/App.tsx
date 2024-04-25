import { useEffect } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
	useEffect(() => {
		const socket = io("http://localhost:3000");
		console.log({ socket });
	}, []);
	return (
		<>
			<h1>Live Cursor Example</h1>
			<button>start</button>
		</>
	);
}

export default App;
