import { type WritableAtom, atom } from 'jotai';
import type { Record_, AtomFormReturn } from '../atomForm';
import type { FieldAtom } from './types';

export type AtomFormReturnAtom<V extends Record_> = WritableAtom<
  AtomFormReturn<V>,
  [V],
  void
>;

export const toFieldAtom = <V extends Record_>(
  a: AtomFormReturnAtom<V>,
): FieldAtom<V> =>
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
