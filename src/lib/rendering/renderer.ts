import Shader from "$lib/rendering/shader";
import Camera from "$lib/rendering/camera";

export default class Renderer {
  positionBuffer: WebGLBuffer | null = null;
  shader: Shader | null = null;

  private gl: WebGLRenderingContext;
  private camera: Camera | null = null;

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

  beginScene(camera: Camera) {
    this.camera = camera;

    this.gl.clearColor(0.3, 0.45, 0.7, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  endScene() {
    if (!this.shader || !this.camera) {
      return;
    }

    this.shader.bind();
    this.shader.setUniformMat4("uProjectionMatrix", this.camera.getProjectionMatrix());
    this.shader.setUniformMat4("uModelViewMatrix", this.camera.getModelViewMatrix());

    const offset = 0;
    const vertexCount = 4;
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
  }

  testDrawSprite(position: { x: number, y: number, z: number }): void {
    const numComps = 2;
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    const positions = [position.x + 0.5, position.y + 0.5, position.x - 0.5, position.y + 0.5, position.x + 0.5, position.y - 0.5, position.x - 0.5, position.y - 0.5];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);

    this.gl.vertexAttribPointer(this.shader?.attribs["aVertexPosition"] || 0, numComps, type, normalize, stride, offset);
    this.gl.enableVertexAttribArray(this.shader?.attribs["aVertexPosition"] || 0);
  }
}
