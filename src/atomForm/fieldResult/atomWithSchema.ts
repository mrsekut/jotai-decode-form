import { type WritableAtom, atom } from 'jotai';
import type { AtomWithSchemaReturn } from '../../atomWithSchema/atomWithSchema';
import type { FieldState } from '../../atomWithSchema/fieldState';
import type { FieldResultAtom, FieldResult } from './types';

export type AtomWithSchemaReturnAtom<V> = WritableAtom<
  AtomWithSchemaReturn<V, any, any>,
  [any],
  void
>;

export const toFieldResultAtom = <V>(
  a: AtomWithSchemaReturnAtom<V>,
): FieldResultAtom<V> =>
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
