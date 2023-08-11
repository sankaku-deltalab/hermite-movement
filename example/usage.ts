import {HermitePath, RawHermitePathNode} from '../src';

// 1. Define path by nodes.
const nodes: RawHermitePathNode[] = [
  {durationMs: 0, pos: {x: 0, y: 0}, velocity: {x: 500, y: 0}},
  {
    durationMs: 200,
    pos: {x: 600, y: 100},
    velocity: {x: 1000, y: 0},
  },
  {durationMs: 500, pos: {x: 2100, y: 100}, velocity: {x: 0, y: 0}},
];

// 2. Create path from nodes.
const hPath = HermitePath.create(nodes);

// 3-1. Calc point at time
{
  const timeMs = 123;
  const {
    done,
    point: {pos, velocity},
  } = HermitePath.calcPointAtTime(hPath, timeMs);
}

// 3-2. Calc delta
{
  const prevTimeMs = 123;
  const currentTimeMs = 124;
  const {
    done,
    currentPoint,
    delta: {posDelta, accel},
  } = HermitePath.calcDeltaAtTime(hPath, prevTimeMs, currentTimeMs);
}
