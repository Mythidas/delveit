<script lang="ts">
	import { Renderer2D } from "$lib/rendering/renderer2d";
	import { assertExists } from "$lib/utils/assert";

	let props = $props();
	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (!assertExists(canvas, "Unable to find gl_canvas. Reload the page to mount the canvas.")) {
			return;
		}

		const gl = canvas.getContext("webgl");
		if (!assertExists(gl, "Unable to initialize WebGL. Your browser or machine may not support it.")) {
			return;
		}

		const pos = { x: 0, y: 0, z: 0 };

		const renderer = new Renderer2D(gl, props.data.vertSource, props.data.fragSource);

		setInterval(() => {
			renderer.drawScene(pos);
		}, 16);
	});
</script>

<main class="flex flex-col w-screen h-screen items-center text-center">
	<div class="w-full p-2 bg-slate-600">
		<h1 class="text-2xl text-white">Delveit</h1>
	</div>
	<div class="flex w-full h-full bg-slate-400 justify-center items-center">
		<canvas bind:this={canvas} width={720} height={720}></canvas>
	</div>
</main>
