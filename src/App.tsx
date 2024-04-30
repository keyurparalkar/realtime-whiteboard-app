import "./App.css";
import { createClient } from "@supabase/supabase-js";

const throttle = <ArgType,>(instance, func: (args: ArgType) => unknown) => {
	let flag: NodeJS.Timeout | null = null;
	const _this = instance;

	return (args: ArgType) => {
		if (flag === null) {
			func.call(_this, args);
			flag = setTimeout(() => {
				flag = null;
			}, 2000);
		}
	};
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the JS client
const clientA = createClient(SUPABASE_URL, SUPABASE_KEY);
const channel = clientA.channel("room-1");

// Create a function to handle inserts
const logger = (payload: unknown) => {
	console.log("Change received! = ", payload);
};

channel
	.on("broadcast", { event: "test" }, (payload: unknown) => logger(payload))
	.subscribe((status) => {
		if (status !== "SUBSCRIBED") {
			return null;
		}

		// Send a message once the client is subscribed
		channel.send({
			type: "broadcast",
			event: "test",
			payload: { message: "hello, world" },
		});
	});

const func = throttle(channel, channel.send);
function App() {
	const handleClick = () => {
		func({
			type: "broadcast",
			event: "test",
			payload: { message: "hello, world" },
		});
	};

	return (
		<div id="container" onClick={handleClick}>
			<h1>Live Cursor Example</h1>
		</div>
	);
}

export default App;
