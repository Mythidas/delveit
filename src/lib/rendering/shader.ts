import { assertExists } from "$lib/utils/assert";
import * as glm from "gl-matrix";

export default class Shader {
  private program: WebGLProgram | null = null;
  attribs: { [id: string]: GLint } = {};
  private uniforms: { [id: string]: WebGLUniformLocation } = {};
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, vsSource: string, fgSource: string, locations: string[]) {
    this.gl = gl;

    const vertShader = this._loadShader(gl.VERTEX_SHADER, vsSource);
    const fragShader = this._loadShader(gl.FRAGMENT_SHADER, fgSource);

    if (!assertExists(vertShader, "Failed to compile vertex shader") || !assertExists(fragShader, "Failed to compile fragment shader")) {
      return;
    }

    this.program = gl.createProgram();
    if (!assertExists(this.program, "Failed to create program")) {
      return;
    }

    gl.attachShader(this.program, vertShader);
    gl.attachShader(this.program, fragShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.log(`Unable to initialize the shader program: ${gl.getProgramInfoLog(this.program)}`);
    }

    this._processLocations(this.program, locations);
  }

  bind(): void {
    this.gl.useProgram(this.program);
  }

  setUniformMat4(loc: string, matrix: glm.mat4) {
    const location = this.uniforms[loc];
    if (!assertExists(location, `Failed to set location: ${loc}`)) {
      return;
    }

    this.gl.uniformMatrix4fv(location, false, matrix);
  }

  private _processLocations(program: WebGLProgram, locations: string[]): void {
    for (const loc of locations) {
      if (loc[0] === 'u') {
        const location = this.gl.getUniformLocation(program, loc);
        if (!assertExists(location, "Failed to find uniform location")) {
          continue;
        }

        this.uniforms[loc] = location;
      } else if (loc[0] === 'a') {
        const location = this.gl.getAttribLocation(program, loc);
        if (!assertExists(location, "Failed to find attrib location")) {
          continue;
        }

        this.attribs[loc] = location;
      }
    }
  }

  private _loadShader(type: GLenum, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!assertExists(shader, "Failed to create shader")) {
      return null;
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(`An error occurred compiling the shader: ${this.gl.getShaderInfoLog(shader)}`);
      return null;
    }

    return shader;
  }
}
