import { type WritableAtom, atom, Getter } from 'jotai';
import type { FieldAtom } from './getters/types';

import * as A from './getters/getAtom';
import * as S from './getters/getField';
import * as F from './getters/getForm';
import { isAtomWithSchema } from '../atomWithSchema/atomWithSchema';

type Read<Fields> = (getter: Getter) => AtomFields<Fields>;

// TODO: type:WritableAtomなら何でも良いということになってしまってる
type AtomFields<Fields> = {
  [K in keyof Fields]:
    | A.AtomReturnAtom<any>
    | S.AtomWithSchemaReturnAtom<any>
    | F.AtomFormReturnAtom<any>;
};

export function atomForm<V extends Record_>(
  read: Read<V>,
): WritableAtom<AtomFormReturn<V>, [V], void> {
  const fieldsAtom = atom(get => f(get)(read(get)));

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
            return withAtomFormSym({
              isValid: false,
            });
          }

          return withAtomFormSym({
            isValid: true,
            values: {
              ...acc.values,
              [k]: field.value,
            },
          });
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
        set(fieldAtom as any, args[k]);
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

const atomFormSym = Symbol('atomFormSym');
export const withAtomFormSym = <T>(t: T) => ({ ...t, [atomFormSym]: true });
const isAtomForm = <V extends Record_>(
  a: any,
): a is WritableAtom<AtomFormReturn<V>, [V], void> => a[atomFormSym] === true;

// prettier-ignore
export type ValuesTypeOf<AtomForm> =
  AtomForm extends WritableAtom<AtomFormReturn<infer Value>, any, any>
    ? Value
    : never;

// TODO: name, type:return
const f =
  (get: Getter) =>
  (
    fields: AtomFields<unknown>,
  ): Record<string, FieldAtom<Record_> | FieldAtom<unknown>> => {
    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => {
        if (isAtomForm(get(v))) {
          return [k, F.toFieldAtom(v)];
        }
        if (isAtomWithSchema(get(v))) {
          return [k, S.toFieldAtom(v)];
        }
        return [k, A.toFieldAtom(v)];
      }),
    );
  };
