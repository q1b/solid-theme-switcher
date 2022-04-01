import { Component, lazy, createEffect, createSignal } from "solid-js";
import { Button } from "./component/btn";
import { createSound } from "./primitives/makeNoice";
import Sound from "./assets/click.wav";
const App: Component = () => {
	const [count, setCount] = createSignal(1);
	const [play, { stop, sound }] = createSound(Sound, {
		onload: () => console.log("LOADED"),
		onend: () => console.log("ENDED"),
		onvolume: () => console.log("volume change"),
		volume: 0.5,
		loop: true,
	});
	createEffect(() => {
		sound()?.volume(count());
	});
	return (
		<>
			<button onClick={() => play()}>Click</button>
			<button onClick={() => stop()}>STOP</button>
			<button onClick={() => setCount(count() + 0.1)}>INC{count()}</button>
			<button onClick={() => setCount(count() - 0.1)}>DEC{count()}</button>
			<Button
				onClick={() => {
					sound()?.play();
					setTimeout(() => {
						sound()?.stop()
					}, 300);
				}}
			/>
		</>
	);
};

export default App;
