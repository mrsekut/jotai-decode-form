import { type WritableAtom, atom } from 'jotai';
import type { Record_, AtomFormReturn } from '../atomForm';
import type { FieldAtom } from './types';

export type GetForm = <V extends Record_>(
  a: WritableAtom<AtomFormReturn<V>, [V], void>,
) => FieldAtom<V>;

export const getFormAtom: GetForm = a =>
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
