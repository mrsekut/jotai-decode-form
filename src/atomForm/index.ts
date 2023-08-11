import { Atom, WritableAtom, atom } from 'jotai';
import { AtomWithSchemaReturn } from '../atomWithSchema/atomWithSchema';
import { FieldState } from '../atomWithSchema/fieldState';
import { recordValueMap } from '../utils/record';

type AtomWithSchema<V> = WritableAtom<
  AtomWithSchemaReturn<V, any, any>,
  [any],
  void
>;

export function atomForm<
  AtomFields extends Record<string, AtomWithSchema<any>>,
>(fields: AtomFields): Atom<AtomFormReturn<AtomFields>> {
  type Output = ReturnType<typeof atomForm<AtomFields>>;

  return atom(get => {
    const statesAtom = recordValueMap(fields, v => get(v).state);
    return fold(recordValueMap(statesAtom, state2result));
  }) as Output;
}

// Return
type AtomFormReturn<AtomFields extends Record<string, AtomWithSchema<any>>> =
  FormResult<PickValuesFromSchema<AtomFields>>;

type PickValuesFromSchema<R> = {
  [K in keyof R]: R[K] extends AtomWithSchema<infer V> ? V : never;
};

// Fold
type FormResult<Values extends Record<string, unknown>> =
  | { isValid: false }
  | { isValid: true; values: Values };

type FieldResult<Value> =
  | { error: string }
  | { error: undefined; value: Value };

type PickValues<R> = {
  [K in keyof R]: R[K] extends { value: infer V } ? V : never;
};

const fold = <R extends Record<string, FieldResult<unknown>>>(
  r: R,
): FormResult<PickValues<R>> => {
  type Output = ReturnType<typeof fold<R>>;
  const init = { values: {}, isValid: true } as Output;

  return Object.entries(r).reduce((acc, [key, value]) => {
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
};

if (import.meta.vitest) {
  const { test, expect, assertType } = import.meta.vitest;

  const input = {
    v1: { error: undefined, value: '1' },
    v2: { error: undefined, value: { i1: 1 } },
  } satisfies Record<string, FieldResult<unknown>>;

  test('Correct return type based on arguments', () => {
    assertType<
      | { isValid: false }
      | {
          isValid: true;
          values: {
            v1: string;
            v2: { i1: number };
          };
        }
    >(fold(input));
  });

  test('Values are folded correctly', () => {
    expect(fold(input)).toStrictEqual({
      isValid: true,
      values: {
        v1: '1',
        v2: { i1: 1 },
      },
    });
  });
}

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
