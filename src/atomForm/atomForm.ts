import { WritableAtom, atom } from 'jotai';
import { AtomWithSchemaReturn } from '../atomWithSchema/atomWithSchema';
import { FieldState } from '../atomWithSchema/fieldState';

type Read<Values> = (getters: Getters) => Fields<Values>;

type Fields<Values> = {
  [K in keyof Values]: FieldAtomWithSym<Values[K]>;
};

type Getters = {
  get: <V>(a: WritableAtom<V, [V], void>) => FieldAtomWithSym<V>;
  getField: <V>(a: AtomWithSchema<V>) => FieldAtomWithSym<V>;
};

type AtomWithSchema<V> = WritableAtom<
  AtomWithSchemaReturn<V, any, any>,
  [any],
  void
>;

export function atomForm<Values extends Record_>(
  read: Read<Values>,
): WritableAtom<AtomFormReturn<Values>, [Values], void> {
  const fields = read({
    get: a => ({
      [sym]: atom(
        get => ({ isValid: true, value: get(a) }),
        (_, set, arg) => set(a, arg),
      ),
    }),
    getField: a => ({
      [sym]: atom(
        get => state2result(get(a).state),
        (get, set, arg) => set(get(a).onChangeInValueAtom, arg),
      ),
    }),
  });

  type Fields = typeof fields;
  const entries = Object.entries(fields) as [
    keyof Fields,
    Fields[keyof Fields],
  ][];

  return atom(
    get => {
      return entries.reduce(
        (acc, [k, v]) => {
          const field = get(v[sym]);

          if (!acc.isValid || !field.isValid) {
            return {
              isValid: false,
            };
          }

          return {
            isValid: true,
            values: {
              ...acc.values,
              [k]: field.value,
            },
          };
        },
        { values: {}, isValid: true } as AtomFormReturn<Values>,
      );
    },
    (_, set, args) => {
      entries.forEach(([k, fieldAtom]) => {
        set(fieldAtom[sym], args[k]);
      });
    },
  );
}

// Return
type AtomFormReturn<S extends Record_> = FormResult<S>;

type FormResult<V extends Record_> =
  | { isValid: false }
  | { isValid: true; values: V };

type FieldResult<Value> =
  | { isValid: false }
  | {
      isValid: true;
      value: Value;
    };

// Utils
const state2result = <V>(state: FieldState<V>): FieldResult<V> => {
  if (state.error != null) {
    return { isValid: false };
  }

  return {
    isValid: true,
    value: state.submitValue,
  };
};

type Record_ = Record<string, unknown>;

const sym = Symbol('field');
type FieldAtomWithSym<Value> = { [sym]: FieldAtom<Value> };
type FieldAtom<Value> = WritableAtom<FieldResult<Value>, [Value], void>;
