import { type WritableAtom, atom } from 'jotai';
import { type GetField, getFieldAtom } from './getters/getField';
import { type GetAtom, getAtom } from './getters/getAtom';
import { type GetForm, getFormAtom } from './getters/getForm';
import type { FieldAtom } from './getters/types';

type Read<Fields> = (getters: Getters) => {
  [K in keyof Fields]: FieldAtom<Fields[K]>;
};

type Getters = {
  get: GetAtom;
  getField: GetField;
  getForm: GetForm;
};

export function atomForm<V extends Record_>(
  read: Read<V>,
): WritableAtom<AtomFormReturn<V>, [V], void> {
  const fields = read({
    get: getAtom,
    getField: getFieldAtom,
    getForm: getFormAtom,
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
export type AtomFormReturn<S extends Record_> = FormResult<S>;

type FormResult<V extends Record_> =
  | { isValid: false }
  | { isValid: true; values: V };

export type Record_ = Record<string, unknown>;
