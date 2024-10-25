import { readFile } from "fs/promises";

export const load = async () => {
	const path = process.cwd() + "/src/lib/assets/shaders/flat";
	const vsFile = await readFile(path + "/vert.glsl", "utf8");
	const fgFile = await readFile(path + "/frag.glsl", "utf8");

	return {
		vertSource: vsFile,
		fragSource: fgFile
	}
};
