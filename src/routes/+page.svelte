<script lang="ts">
	import Renderer from "$lib/rendering/renderer";
	import Camera from "$lib/rendering/camera";
	import { assertExists } from "$lib/utils/assert";

	let props = $props();
	let canvas: HTMLCanvasElement;

	let stats = $state({
		fps: 0.0,
		batches: 0,
	});

	$effect(() => {
		if (
			!assertExists(
				canvas,
				"Unable to find gl_canvas. Reload the page to mount the canvas.",
			)
		) {
			return;
		}

		const gl = canvas.getContext("webgl");
		if (
			!assertExists(
				gl,
				"Unable to initialize WebGL. Your browser or machine may not support it.",
			)
		) {
			return;
		}

		const pos = { x: 0, y: 0, z: 0 };

		const renderer = Renderer.build(
			gl,
			props.data.vertSource,
			props.data.fragSource,
		);

		if (!assertExists(renderer, "Failed to create renderer")) {
			return;
		}

		const camera = new Camera();

		let lastFrame = Date.now();

		const interval = setInterval(() => {
			stats.fps = 1000 / (Date.now() - lastFrame);
			lastFrame = Date.now();

			renderer.beginScene(camera);
			renderer.draw(pos);
			renderer.draw({ x: 1, y: 1, z: 0.0 });
			renderer.endScene();

			stats.batches = renderer.getBatchInfo().drawCalls;
		}, 16);

		return () => {
			renderer.destruct();
			clearInterval(interval);
		};
	});
</script>

<main
	class="flex flex-col w-screen h-screen items-center text-center text-white"
>
	<div class="w-full p-2 bg-slate-600">
		<h1 class="text-2xl text-white">Delveit</h1>
	</div>
	<div
		class="flex relative w-full h-full bg-slate-400 justify-center items-center"
	>
		<div
			class="flex absolute flex-col top-5 left-5 p-2 bg-gray-800/70 rounded-md"
		>
			<p>FPS: <span>{stats.fps.toPrecision(3)}</span></p>
			<p>BATCHES: <span>{stats.batches}</span></p>
		</div>
		<canvas bind:this={canvas} width={720} height={720}></canvas>
	</div>
</main>
