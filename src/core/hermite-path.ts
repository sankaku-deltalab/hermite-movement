import cubicHermite from 'cubic-hermite';
import {Vec2d} from './vec2d';

type MilliSeconds = number;

export type RawHermitePathNode = {
  /** Duration to come this node from previous node [milliseconds]. */
  durationMs: MilliSeconds;
  pos: Vec2d;
  velocity: Vec2d;
};

export type HermitePath = {
  paths: HermitePathPart[];
};

type HermitePathPart = {
  start: HermitePathNode;
  end: HermitePathNode;
};

type HermitePathNode = {
  timeMs: MilliSeconds;
  position: Vec2d;
  velocity: Vec2d;
};

export namespace HermitePath {
  export type Point = {pos: Vec2d; velocity: Vec2d};

  export function create(nodes: RawHermitePathNode[]): HermitePath {
    if (nodes.length === 0)
      throw new Error('HermiteInterpolation create error.');
    if (nodes.length === 1) {
      const firstDest = nodes[0];
      const path: HermitePathPart = {
        start: {
          position: firstDest.pos,
          velocity: Vec2d.zero(),
          timeMs: 0,
        },
        end: {
          position: firstDest.pos,
          velocity: Vec2d.zero(),
          timeMs: 0,
        },
      };
      return {paths: [path]};
    }

    let totalTimeMs = nodes[0].durationMs;
    const paths: HermitePathPart[] = [];
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const next = nodes[i];
      const startTimeMs = totalTimeMs;
      const endTimeMs = totalTimeMs + next.durationMs;

      const startVelocityRaw = prev.velocity;
      const speedMlt = next.durationMs;
      const path: HermitePathPart = {
        start: {
          position: prev.pos,
          velocity: Vec2d.mlt(startVelocityRaw, speedMlt),
          timeMs: startTimeMs,
        },
        end: {
          position: next.pos,
          velocity: Vec2d.mlt(prev.velocity, speedMlt),
          timeMs: endTimeMs,
        },
      };

      paths.push(path);
      totalTimeMs += next.durationMs;
    }
    return {paths};
  }

  export function getEndTimeMs(path: HermitePath): MilliSeconds {
    return path.paths[path.paths.length - 1].end.timeMs;
  }

  export function calcPointAtTime(
    path: HermitePath,
    timeMs: MilliSeconds
  ): {done: boolean; point: Point} {
    // NOTE: I should use fast search to find current path if I need more speed.
    for (const p of path.paths) {
      if (timeMs < p.start.timeMs) continue;
      if (timeMs >= p.end.timeMs) continue;
      return {done: false, point: calcPointFromPath(p, timeMs)};
    }
    return {done: true, point: calcEndPoint(path)};
  }

  function calcPointFromPath(path: HermitePathPart, timeMs: number): Point {
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
      pos: aryToVec2d(cubicHermite(p0, v0, p1, v1, t)),
      velocity: aryToVec2d(cubicHermite.derivative(p0, v0, p1, v1, t)),
    };
  }

  function calcEndPoint(movement: HermitePath): Point {
    const finalPath = movement.paths[movement.paths.length - 1];
    const finalTime = finalPath.end.timeMs;
    return calcPointFromPath(finalPath, finalTime);
  }

  export function calcDeltaAtTime(
    path: HermitePath,
    prevTimeMs: MilliSeconds,
    nextTimeMs: MilliSeconds
  ): {
    done: boolean;
    currentPoint: Point;
    delta: {posDelta: Vec2d; accel: Vec2d};
  } {
    const {point: prevPoint} = calcPointAtTime(path, prevTimeMs);
    const {point: currentPoint, done} = calcPointAtTime(path, nextTimeMs);

    const timeDeltaMs = nextTimeMs - prevTimeMs;
    const posDelta = Vec2d.sub(currentPoint.pos, prevPoint.pos);
    const accel = Vec2d.mlt(posDelta, 1 / timeDeltaMs);
    return {done, currentPoint, delta: {posDelta, accel}};
  }
}

const vec2dToAry = (v: Vec2d): [number, number] => {
  return [v.x, v.y];
};

const aryToVec2d = ([x, y]: [number, number]): Vec2d => {
  return {x, y};
};
