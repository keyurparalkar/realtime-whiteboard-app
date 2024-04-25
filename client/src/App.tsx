import { useEffect } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
	useEffect(() => {
		const socket = io("http://localhost:3000");

		socket.on("new-user", (id: string, count: number) => {
			console.log({ id, count });
		});
	}, []);
	return (
		<>
			<h1>Live Cursor Example</h1>
			<button>start</button>
		</>
	);
}

export default App;
