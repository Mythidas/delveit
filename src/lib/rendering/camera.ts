import Entity from "$lib/core/entity";
import * as glm from "gl-matrix";

export default class Camera extends Entity {
  fieldOfView: number = 45;
  aspectRatio: number = 1;
  nearClip: number = 0.1;
  farClip: number = 100.0;

  private projectionMatrix: glm.mat4;
  private modelViewMatrix: glm.mat4;

  constructor() {
    super([0.0, 0.0, -6.0]);

    this.projectionMatrix = glm.mat4.create();
    this.modelViewMatrix = glm.mat4.create();
    this.validateProjection();
  }

  validateProjection(): void {
    glm.mat4.perspective(this.projectionMatrix, (this.fieldOfView * Math.PI) / 180, this.aspectRatio, this.nearClip, this.farClip);
  }

  getProjectionMatrix(): glm.mat4 {
    return this.projectionMatrix;
  }

  getModelViewMatrix(): glm.mat4 {
    const identity = glm.mat4.create();
    glm.mat4.translate(identity, this.modelViewMatrix, this._getInversePosition());
    return identity;
  }

  private _getInversePosition(): glm.vec3 {
    const inverse = glm.vec3.create();
    inverse[0] = -this.position[0];
    inverse[1] = -this.position[1];
    inverse[2] = this.position[2];
    return inverse;
  }
}
