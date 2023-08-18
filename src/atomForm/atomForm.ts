import { WritableAtom, atom } from 'jotai';
import { AtomWithSchemaReturn } from '../atomWithSchema/atomWithSchema';
import { FieldState } from '../atomWithSchema/fieldState';

type Read<Fields> = (getters: Getters) => {
  [K in keyof Fields]: WritableAtom<FieldResult<Fields[K]>, [Fields[K]], void>;
};

type Getters = {
  get: GetAtom;
  getField: GetField;
};

type GetAtom = <V>(
  a: WritableAtom<V, [V], void>,
) => WritableAtom<FieldResult<V>, [V], void>;

type GetField = <V>(
  a: AtomWithSchema<V>,
) => WritableAtom<FieldResult<V>, [V], void>;

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
