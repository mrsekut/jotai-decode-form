import { type WritableAtom, atom } from 'jotai';
import type { AtomWithSchemaReturn } from '../../atomWithSchema/atomWithSchema';
import type { FieldState } from '../../atomWithSchema/fieldState';
import type { FieldAtom, FieldResult } from './types';

export type GetField = <V>(a: AtomWithSchema<V>) => FieldAtom<V>;

type AtomWithSchema<V> = WritableAtom<
  AtomWithSchemaReturn<V, any, any>,
  [any],
  void
>;

export const getFieldAtom = <V>(a: AtomWithSchema<V>): FieldAtom<V> =>
  atom(
    get => state2result(get(a).state),
    (get, set, arg) => set(get(a).onChangeInValueAtom, arg),
  );

const state2result = <V>(state: FieldState<V>): FieldResult<V> => {
  if (state.error != null) {
    return { isValid: false };
  }

  return {
    isValid: true,
    value: state.submitValue,
  };
};