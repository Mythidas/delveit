import Entity from "$lib/core/entity";
import type Camera from "$lib/rendering/camera";
import Renderer from "$lib/rendering/renderer";
import { assertExists, assertNotExists } from "$lib/utils/assert";

export class DelvEngine {
  renderer: Renderer;
  private entities: Entity[] = [];

  static instance: DelvEngine | null = null;

  constructor(renderer: Renderer) {
    if (!DelvEngine.instance) {
      DelvEngine.instance = this;
    }
    this.renderer = renderer;
  }

  destruct(): void {
    this.renderer.destruct();
  }

  static build(vsSource: string, fgSource: string): DelvEngine | null {
    if (!assertNotExists(DelvEngine.instance, "DelvEngine instance already exists!")) {
      return null;
    }

    const renderer = Renderer.build(vsSource, fgSource);
    if (!assertExists(renderer, "Failed to create renderer")) {
      return null;
    }

    return new DelvEngine(renderer);
  }

  update(camera: Camera): void {
    this.renderer.beginScene(camera);
    this.renderer.endScene();
  }

  createEntity(entity: Entity) {
    this.entities.push(entity);
  }
}
