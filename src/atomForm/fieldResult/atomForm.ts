import { type WritableAtom, atom } from 'jotai';
import type { AtomFormReturn } from '../atomForm';
import type { FieldResultAtom } from './types';

export type AtomFormReturnAtom<V> = WritableAtom<AtomFormReturn<V>, [V], void>;

export const toFieldResultAtom = <V>(
  a: AtomFormReturnAtom<V>,
): FieldResultAtom<V> =>
  atom(
    get => {
      const v = get(a);
      return v.isValid
        ? {
            isValid: true,
            value: v.values,
          }
        : v;
    },
    (_, set, arg) => set(a, arg),
  );
