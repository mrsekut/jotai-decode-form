import { WritableAtom, atom } from 'jotai';
import { AtomWithSchemaReturn } from '../atomWithSchema/atomWithSchema';
import { FieldState } from '../atomWithSchema/fieldState';

type Read<Fields> = (getters: Getters) => {
  [K in keyof Fields]: FieldAtom<Fields[K]>;
};

type Getters = {
  get: <V>(a: WritableAtom<V, [V], void>) => FieldAtom<V>;
  getField: <V>(a: AtomWithSchema<V>) => FieldAtom<V>;
  getForm: <V extends Record_>(
    a: WritableAtom<AtomFormReturn<V>, [V], void>,
  ) => FieldAtom<V>;
};

type AtomWithSchema<V> = WritableAtom<
  AtomWithSchemaReturn<V, any, any>,
  [any],
  void
>;

export function atomForm<V extends Record_>(
  read: Read<V>,
): WritableAtom<AtomFormReturn<V>, [V], void> {
  const fields = read({
    get: a =>
      atom(
        get => ({ isValid: true, value: get(a) }),
        (_, set, arg) => set(a, arg),
      ),
    getField: a =>
      atom(
        get => state2result(get(a).state),
        (get, set, arg) => set(get(a).onChangeInValueAtom, arg),
      ),
    getForm: a =>
      atom(
        get => {
          const v = get(a);
          return v.isValid ? { isValid: true, value: v.values } : v;
        },
        (_, set, arg) => set(a, arg),
      ),
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
          const field = get(v);

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
        { values: {}, isValid: true } as AtomFormReturn<V>,
      );
    },
    (_, set, args) => {
      entries.forEach(([k, fieldAtom]) => {
        set(fieldAtom, args[k]);
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
type FieldAtom<Value> = WritableAtom<FieldResult<Value>, [Value], void>;
