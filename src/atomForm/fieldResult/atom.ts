import { type WritableAtom, atom, SetStateAction } from 'jotai';
import type { FieldResultAtom } from './types';

export type AtomReturnAtom<V> = WritableAtom<V, [SetStateAction<V>], void>;

export const toFieldResultAtom = <V>(
  a: AtomReturnAtom<V>,
): FieldResultAtom<V> =>
  atom(
    get => ({
      isValid: true,
      value: get(a),
    }),
    (_, set, arg) => set(a, arg),
  );
