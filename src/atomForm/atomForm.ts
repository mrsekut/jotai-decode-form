import { type WritableAtom, atom, Getter } from 'jotai';
import { toFieldAtom, AtomReturnAtom } from './getters/getAtom';
import type { FieldAtom } from './getters/types';

type Read<Fields> = (getter: Getter) => AtomFields<Fields>;

type AtomFields<Fields> = {
  [K in keyof Fields]: AtomReturnAtom<Fields[K]>;
};

export function atomForm<V extends Record_>(
  read: Read<V>,
): WritableAtom<AtomFormReturn<V>, [V], void> {
  const fieldsAtom = atom(get => f(read(get)));

  // TODO: clean
  return atom(
    get => {
      const fields = get(fieldsAtom);
      type Fields = typeof fields;
      const entries = Object.entries(fields) as [
        keyof Fields,
        Fields[keyof Fields],
      ][];
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
    (get, set, args) => {
      const fields = get(fieldsAtom);
      type Fields = typeof fields;
      const entries = Object.entries(fields) as [
        keyof Fields,
        Fields[keyof Fields],
      ][];
      entries.forEach(([k, fieldAtom]) => {
        set(fieldAtom, args[k]);
      });
    },
  );
}

// Return
export type AtomFormReturn<S extends Record_> = FormResult<S>;

type FormResult<V extends Record_> =
  | { isValid: false }
  | { isValid: true; values: V };

export type Record_ = Record<string, unknown>;

// prettier-ignore
export type ValuesTypeOf<AtomForm> =
  AtomForm extends WritableAtom<AtomFormReturn<infer Value>, any, any>
    ? Value
    : never;

// TODO: name, type:return
const f = (fields: AtomFields<unknown>): Record<string, FieldAtom<unknown>> => {
  return Object.fromEntries(
    Object.entries(fields).map(([k, v]) => {
      // TODO: isAtom
      return [k, toFieldAtom(v)];
    }),
  );
};
