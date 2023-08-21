import { type WritableAtom, atom, SetStateAction } from 'jotai';
import type { FieldAtom } from './types';

export type GetAtom = <V>(
  a: WritableAtom<V, [SetStateAction<V>], void>,
) => FieldAtom<V>;

export const getAtom: GetAtom = a =>
  atom(
    get => ({
      isValid: true,
      value: get(a),
    }),
    (_, set, arg) => set(a, arg),
  );
