import { type WritableAtom, atom } from 'jotai';
import type { FieldAtom } from './types';

export type GetAtom = <V>(a: WritableAtom<V, [V], void>) => FieldAtom<V>;

export const getAtom = <V>(a: WritableAtom<V, [V], void>): FieldAtom<V> =>
  atom(
    get => ({
      isValid: true,
      value: get(a),
    }),
    (_, set, arg) => set(a, arg),
  );
