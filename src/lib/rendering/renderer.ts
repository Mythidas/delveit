import { Shader } from "$lib/rendering/shader";
import * as glm from "gl-matrix";

export class Renderer2D {
  positionBuffer: WebGLBuffer | null = null;
  shader: Shader | null = null;

  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, vsSource: string, fgSource: string) {
    this.gl = gl;

    this.shader = new Shader(this.gl, vsSource, fgSource, [
      "aVertexPosition",
      "uModelViewMatrix",
      "uProjectionMatrix"
    ]);
    this.positionBuffer = gl.createBuffer();
    if (!this.positionBuffer) return;
  }

  drawScene(position: { x: number, y: number, z: number }): void {
    this.gl.clearColor(0.3, 0.45, 0.7, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const fov = (45 * Math.PI) / 180;
    const aspect = 480.0 / 720.0;
    const zNear = 0.1;
    const zFar = 100.0;

    const projMatrix = glm.mat4.create();
    glm.mat4.perspective(projMatrix, fov, aspect, zNear, zFar);

    const modelViewMatrix = glm.mat4.create();
    glm.mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

    const numComps = 2;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    const positions = [position.x + 0.5, position.y + 0.5, position.x -0.5, position.y + 0.5, position.x + 0.5, position.y - 0.5, position.x - 0.5, position.y - 0.5];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);

    this.gl.vertexAttribPointer(this.shader?.attribs["aVertexPosition"] || 0, numComps, type, normalize, stride, offset);
    this.gl.enableVertexAttribArray(this.shader?.attribs["aVertexPosition"] || 0);

    if (!this.shader) {
      return;
    }
    this.gl.useProgram(this.shader.program);

    const projUniformLoc = this.shader?.uniforms["uProjectionMatrix"];
    const mdvwUniformLoc = this.shader?.uniforms["uModelViewMatrix"];
    if (!projUniformLoc || !mdvwUniformLoc) {
      console.log(this.shader.uniforms);
      console.error("Failed to find locations");
      return;
    }

    this.gl.uniformMatrix4fv(projUniformLoc, false, projMatrix);
    this.gl.uniformMatrix4fv(mdvwUniformLoc, false, modelViewMatrix);

    {
      const offset = 0;
      const vertexCount = 4;
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }
}
