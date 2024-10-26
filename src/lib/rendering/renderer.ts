import Shader from "$lib/rendering/shader";
import Camera from "$lib/rendering/camera";
import { assertExists } from "$lib/utils/assert";

const MAX_QUADS = 1000;
const MAX_VERTICES = MAX_QUADS * 12;

interface RenderContext {
  vbo: WebGLBuffer;
  vertexData: Float32Array;

  batch: {
    drawCalls: number;
    vertices: number;
  }
}

export default class Renderer {
  private shader: Shader;
  private gl: WebGLRenderingContext;
  private camera: Camera | null = null;
  private context: RenderContext;

  constructor(gl: WebGLRenderingContext, shader: Shader, context: RenderContext) {
    this.gl = gl;
    this.shader = shader;
    this.context = context;
  }

  destruct(): void {
    this.gl.deleteBuffer(this.context.vbo);
    this.shader.destruct();
  }

  static build(gl: WebGLRenderingContext, vsSource: string, fgSource: string): Renderer | null {
    const shader = new Shader(gl, vsSource, fgSource, [
      "aVertexPosition",
      "uProjectionMatrix",
      "uModelViewMatrix"
    ]);
    const vbo = gl.createBuffer();

    if (!assertExists(vbo, "Failed to create array buffer")) {
      return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_VERTICES * 32, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(shader?.attribs["aVertexPosition"] || 0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shader?.attribs["aVertexPosition"] || 0);

    return new Renderer(gl, shader, {
      vbo,
      vertexData: new Float32Array(MAX_VERTICES),
      batch: {
        drawCalls: 0,
        vertices: 0
      }
    });
  }

  getBatchInfo() {
    return this.context.batch;
  }

  beginScene(camera: Camera) {
    this.camera = camera;

    this.gl.clearColor(0.3, 0.45, 0.7, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.context.batch.drawCalls = 0;
  }

  endScene() {
    this.flush();
  }

  flush() {
    if (!this.shader || !this.camera) {
      return;
    }

    this.shader.bind();
    this.shader.setUniformMat4("uProjectionMatrix", this.camera.getProjectionMatrix());
    this.shader.setUniformMat4("uModelViewMatrix", this.camera.getModelViewMatrix());

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.context.vbo);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.context.vertexData);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.context.batch.vertices * 0.5);

    this.context.batch.vertices = 0;
    this.context.batch.drawCalls += 1;
  }

  draw(position: { x: number, y: number, z: number }): void {
    if (this.context.batch.vertices >= MAX_VERTICES) {
      this.flush();
    }

    this.context.vertexData.set([
      position.x + 0.5, position.y + 0.5,
      position.x - 0.5, position.y + 0.5,
      position.x + 0.5, position.y - 0.5,

      position.x + 0.5, position.y - 0.5,
      position.x - 0.5, position.y - 0.5,
      position.x - 0.5, position.y + 0.5
    ], this.context.batch.vertices);

    this.context.batch.vertices += 12;
  }
}
