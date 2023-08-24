import { type WritableAtom, atom, SetStateAction } from 'jotai';
import type { FieldAtom } from './types';

export type AtomReturnAtom<V> = WritableAtom<V, [SetStateAction<V>], void>;

export const toFieldAtom = <V>(a: AtomReturnAtom<V>): FieldAtom<V> =>
  atom(
    get => ({
      isValid: true,
      value: get(a),
    }),
    (_, set, arg) => set(a, arg),
  );
