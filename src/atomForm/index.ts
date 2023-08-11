import { Atom, WritableAtom, atom } from 'jotai';
import { AtomWithSchemaReturn } from '../atomWithSchema/atomWithSchema';
import { FieldState } from '../atomWithSchema/fieldState';

type AtomWithSchema<V> = WritableAtom<
  AtomWithSchemaReturn<V, any, any>,
  [any],
  void
>;

export function atomForm<
  AtomFields extends Record<string, AtomWithSchema<any>>,
>(fields: AtomFields): Atom<AtomFormReturn<AtomFields>> {
  return atom(get => {
    const init = { values: {}, isValid: true } as AtomFormReturn<AtomFields>;
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
  });
}

// Return
type AtomFormReturn<AtomFields extends Record<string, AtomWithSchema<any>>> =
  FormResult<PickValuesFromSchema<AtomFields>>;

type PickValuesFromSchema<R> = {
  [K in keyof R]: R[K] extends AtomWithSchema<infer V> ? V : never;
};

type FormResult<Values extends Record<string, unknown>> =
  | { isValid: false }
  | { isValid: true; values: Values };

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
