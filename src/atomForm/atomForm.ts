import { WritableAtom, atom } from 'jotai';
import { AtomWithSchemaReturn } from '../atomWithSchema/atomWithSchema';
import { FieldState } from '../atomWithSchema/fieldState';

type Values = Record<string, unknown>;

type AtomFields<T> = {
  [K in keyof T]: AtomWithSchema<T[K]>;
};

type AtomWithSchema<V> = WritableAtom<
  AtomWithSchemaReturn<V, any, any>,
  [any],
  void
>;

export function atomForm<
  V extends PickValuesFromSchema<Fields>,
  Fields extends Record<string, AtomWithSchema<any>> = AtomFields<V>,
>(fields: Fields): WritableAtom<AtomFormReturn<V>, [V], void> {
  return atom(
    get => {
      const init = { values: {}, isValid: true } as AtomFormReturn<V>;
      return Object.entries(fields)
        .map(([k, v]) => [k, get(v).state] as const)
        .map(([k, v]) => [k, state2result(v)] as const)
        .reduce((acc, [key, value]) => {
          if (!acc.isValid || value.error != null) {
            return {
              isValid: false,
            };
          }

          return {
            isValid: true,
            values: {
              ...acc.values,
              [key]: value.value,
            },
          };
        }, init);
    },
    (get, set, args) => {
      Object.entries(fields).forEach(([k, fieldAtom]) => {
        set(get(fieldAtom).onChangeInValueAtom, args[k]);
      });
    },
  );
}

// Return
type AtomFormReturn<S extends Values> = FormResult<S>;

type PickValuesFromSchema<R> = {
  [K in keyof R]: R[K] extends AtomWithSchema<infer V> ? V : never;
};

type FormResult<V extends Values> =
  | { isValid: false }
  | { isValid: true; values: V };

type FieldResult<Value> =
  | { error: string }
  | { error: undefined; value: Value };

// Utils
const state2result = <V>(state: FieldState<V>): FieldResult<V> => {
  if (state.error != null) {
    return { error: state.error };
  }

  return {
    error: undefined,
    value: state.submitValue,
  };
};
