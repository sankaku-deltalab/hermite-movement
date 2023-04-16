import cubicHermite from 'cubic-hermite';
import {TVec2d, Vec2d} from './vec2d';

export type HermiteMovement = {
  startVelocity: Vec2d;
  destinations: MoveDestination[];
};

type MoveDestination = {
  durationMs: number;
  position: Vec2d;
  endVelocity: Vec2d;
  startVelocityOverride?: Vec2d;
};

export type CompiledHermiteMovement = {
  paths: HermiteMovePath[];
};

type HermiteMovePath = {
  start: HermiteMovePoint;
  end: HermiteMovePoint;
};

type HermiteMovePoint = {
  timeMs: number;
  position: Vec2d;
  velocity: Vec2d;
};

export class HermiteInterpolation {
  static compile(movement: HermiteMovement): CompiledHermiteMovement {
    const zeroDest: MoveDestination = {
      position: TVec2d.zero(),
      endVelocity: movement.startVelocity,
      durationMs: 0,
    }; // first point is not destination but represented as destination
    return this.compileDestinations([zeroDest, ...movement.destinations]);
  }

  private static compileDestinations(
    destinations: MoveDestination[]
  ): CompiledHermiteMovement {
    if (destinations.length === 0)
      throw new Error('HermiteInterpolation compile error.');
    if (destinations.length === 1) {
      const firstDest = destinations[0];
      const path: HermiteMovePath = {
        start: {
          position: firstDest.position,
          velocity: TVec2d.zero(),
          timeMs: 0,
        },
        end: {
          position: firstDest.position,
          velocity: TVec2d.zero(),
          timeMs: 0,
        },
      };
      return {paths: [path]};
    }

    let totalTimeMs = 0;
    const paths: HermiteMovePath[] = [];
    for (let i = 1; i < destinations.length; i++) {
      const prev = destinations[i - 1];
      const next = destinations[i];
      const startTimeMs = totalTimeMs;
      const endTimeMs = totalTimeMs + next.durationMs;

      const startVelocityRaw = next.startVelocityOverride ?? prev.endVelocity;
      const speedMlt = next.durationMs;
      const path: HermiteMovePath = {
        start: {
          position: prev.position,
          velocity: TVec2d.mlt(startVelocityRaw, speedMlt),
          timeMs: startTimeMs,
        },
        end: {
          position: next.position,
          velocity: TVec2d.mlt(prev.endVelocity, speedMlt),
          timeMs: endTimeMs,
        },
      };

      paths.push(path);
      totalTimeMs += next.durationMs;
    }
    return {paths};
  }

  static calcPositionAndVelocity(
    movement: CompiledHermiteMovement,
    timeMs: number
  ): {done: boolean; velocity: Vec2d; position: Vec2d} {
    for (const p of movement.paths) {
      if (timeMs < p.start.timeMs) continue;
      if (timeMs >= p.end.timeMs) continue;
      return {done: false, ...this.calcPointFromPath(p, timeMs)};
    }
    return {done: true, ...this.calcEndPoint(movement)};
  }

  private static calcPointFromPath(
    path: HermiteMovePath,
    timeMs: number
  ): {velocity: Vec2d; position: Vec2d} {
    const p0 = vec2dToAry(path.start.position);
    const p1 = vec2dToAry(path.end.position);
    const v0 = vec2dToAry(path.start.velocity);
    const v1 = vec2dToAry(path.end.velocity);

    let t = 1;
    try {
      t = (timeMs - path.start.timeMs) / (path.end.timeMs - path.start.timeMs);
    } catch {
      // path can zero div
    }

    return {
      position: aryToVec2d(cubicHermite(p0, v0, p1, v1, t)),
      velocity: aryToVec2d(cubicHermite.derivative(p0, v0, p1, v1, t)),
    };
  }

  private static calcEndPoint(movement: CompiledHermiteMovement): {
    velocity: Vec2d;
    position: Vec2d;
  } {
    const finalPath = movement.paths[movement.paths.length - 1];
    const finalTime = finalPath.end.timeMs;
    return this.calcPointFromPath(finalPath, finalTime);
  }
}

const vec2dToAry = (v: Vec2d): [number, number] => {
  return [v.x, v.y];
};

const aryToVec2d = ([x, y]: [number, number]): Vec2d => {
  return {x, y};
};
