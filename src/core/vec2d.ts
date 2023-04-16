export type Vec2d = {x: number; y: number};

export class TVec2d {
  static zero(): Vec2d {
    return {x: 0, y: 0};
  }

  static sub(v1: Vec2d, v2: Vec2d): Vec2d {
    return {x: v1.x - v2.x, y: v1.y - v2.y};
  }

  static mlt(v: Vec2d, scale: number): Vec2d {
    return {x: v.x * scale, y: v.y * scale};
  }
}
