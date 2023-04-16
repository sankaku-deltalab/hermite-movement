import {
  CompiledHermiteMovement,
  HermiteInterpolation,
  HermiteMovement,
} from './hermite-interpolation';
import {TVec2d, Vec2d} from './vec2d';

export type MovementState = {
  compiledMovement: CompiledHermiteMovement;

  consumedTimeMs: number;
  position: Vec2d;
  velocity: Vec2d;
  done: boolean;
};

export type MovementDelta = {
  positionDelta: Vec2d;
  velocityDelta: Vec2d;
  doneDelta: boolean;
  done: boolean;
};

export class THermiteMovement {
  static compileMovement(movement: HermiteMovement): CompiledHermiteMovement {
    return HermiteInterpolation.compile(movement);
  }

  static new(movement: CompiledHermiteMovement): MovementState {
    const initial = HermiteInterpolation.calcPositionAndVelocity(movement, 0);

    return {
      compiledMovement: movement,
      consumedTimeMs: 0,
      position: initial.position,
      velocity: initial.velocity,
      done: initial.done,
    };
  }

  static update(
    state: MovementState,
    timeDeltaMs: number
  ): [MovementDelta, MovementState] {
    const newTimeMs = state.consumedTimeMs + timeDeltaMs;
    const r = HermiteInterpolation.calcPositionAndVelocity(
      state.compiledMovement,
      newTimeMs
    );

    const newState: MovementState = {
      ...state,
      consumedTimeMs: newTimeMs,
      done: r.done,
      position: r.position,
      velocity: r.velocity,
    };

    const delta: MovementDelta = {
      done: newState.done,
      doneDelta: !state.done && newState.done,
      positionDelta: TVec2d.sub(newState.position, state.position),
      velocityDelta: TVec2d.sub(newState.velocity, state.velocity),
    };

    return [delta, newState];
  }
}
