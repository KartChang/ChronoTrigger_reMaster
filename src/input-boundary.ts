import type {State} from './core';

type BoundaryState = Pick<State, 'chapter' | 'opening' | 'kingdom' | 'rescue'> & Partial<Pick<State,'prologue'>>;
const key = (state: BoundaryState): string =>
  `${state.chapter}/${state.opening.phase}/${state.kingdom.phase}/${state.rescue.stage}/${state.prologue?.stage??'legacy'}/${state.prologue?.transition?'transition':'stable'}`;

/** Tracks input-invalidating transitions, not render frames.
 * Explicit state replacement rebases immediately; it must not clear a newly
 * pressed key on the following render frame. Simulation transitions consume
 * once and discard the remaining old-input substeps.
 */
export class InputBoundary {
  private current: string;
  constructor(state: BoundaryState) { this.current = key(state); }
  rebase(state: BoundaryState): void { this.current = key(state); }
  consume(state: BoundaryState): boolean {
    const next = key(state);
    if (next === this.current) return false;
    this.current = next;
    return true;
  }
}
