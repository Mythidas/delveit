import { vec3 } from "gl-matrix";

export default class Entity {
  position: vec3;

  constructor(position?: vec3) {
    this.position = position || vec3.create();
  }
}
