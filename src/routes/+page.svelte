<script lang="ts">
	import Renderer from "$lib/rendering/renderer";
	import Camera from "$lib/rendering/camera";
	import { assertExists } from "$lib/utils/assert";
	import { DelvEngine } from "$lib/core/delvengine";

	let props = $props();
	let canvas: HTMLCanvasElement;

	let stats = $state({
		fps: 0.0,
		batches: 0,
	});

	$effect(() => {
		if (!canvas) {
			console.error("Failed to find gl_canvas. Try reloading the page");
			return;
		}

		const gl = canvas.getContext("webgl");
		if (!gl) {
			console.error("Failed to get WebGL. Your browser may not support it");
			return;
		}

		const engine = DelvEngine.build(
			props.data.vertSource,
			props.data.fragSource,
		);
		if (!assertExists(engine, "Failed to create engine")) {
			return;
		}

		const camera = new Camera();

		const interval = setInterval(() => {
			engine.update(camera);
		}, 16);

		return () => {
			engine.destruct();
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
		<canvas id="gl_canvas" bind:this={canvas} width={720} height={720}></canvas>
	</div>
</main>
