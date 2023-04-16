# hermite-movement

Define movement path with [Cubic Hermite spline](https://en.wikipedia.org/wiki/Cubic_Hermite_spline).

## Usage

```typescript
import {HermiteMovement, THermiteMovement} from 'hermite-movement';

// 1. Define movement and compile it.
const mv: HermiteMovement = {
  startVelocity: {x: 0, y: 0},
  destinations: [
    {durationMs: 500, position: {x: 500, y: 0}, endVelocity: {x: 500, y: 0}},
    {
      durationMs: 200,
      position: {x: 600, y: 100},
      endVelocity: {x: 0, y: 100},
      startVelocityOverride: {x: 1000, y: 0},
    },
    {durationMs: 500, position: {x: 2100, y: 100}, endVelocity: {x: 0, y: 0}},
  ],
};
const compiledMv = THermiteMovement.compileMovement(mv);

// 2. Create state
const state = THermiteMovement.new(compiledMv);

// 3. Update it
const timeDeltaMs = 123;
const [delta, newState] = THermiteMovement.update(state, timeDeltaMs);

// 4. Use delta or new state
console.log(
  delta.done,
  delta.doneDelta,
  delta.positionDelta,
  delta.velocityDelta
);
console.log(
  newState.done, // = delta.done
  newState.position,
  newState.velocity
);
```