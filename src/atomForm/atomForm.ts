import { type WritableAtom, atom, Getter } from 'jotai';
import type { FieldResultAtom } from './fieldResult/types';
import { type PickByValues, toFieldResultAtom } from './fieldResult';

type Read<AtomFields> = (getter: Getter) => AtomFields;

export function atomForm<
  Values extends PickByValues<AtomFields>,
  AtomFields extends Record<string, WritableAtom<any, any, any>> = any,
>(
  read: Read<AtomFields>,
): WritableAtom<AtomFormReturn<Values>, [Values], void> {
  type FieldResults = {
    [K in keyof Values]: FieldResultAtom<Values[K]>;
  };
  const fieldsAtom = atom(get => toFieldResultAtom(get)(read(get)));

  return atom(
    get => {
      const fields = get(fieldsAtom);
      const entries = Object.entries(fields) as [
        keyof FieldResults,
        FieldResults[keyof FieldResults],
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
        { values: {}, isValid: true } as AtomFormReturn<Values>,
      );
    },
    (get, set, args) => {
      const fields = get(fieldsAtom);
      const entries = Object.entries(fields) as [
        keyof FieldResults,
        FieldResults[keyof FieldResults],
      ][];

      entries.forEach(([k, fieldAtom]) => {
        set(fieldAtom, args[k]);
      });
    },
  );
}

// Return
export type AtomFormReturn<Values extends FormValues> = FormResult<Values>;

type FormResult<V extends FormValues> =
  | { isValid: false }
  | { isValid: true; values: V };

export type FormValues = Record<string, unknown>;

// Symbol
const atomFormSym = Symbol('atomFormSym');
export const withAtomFormSym = <T>(t: T) => ({ ...t, [atomFormSym]: true });
export const isAtomForm = <V extends FormValues>(
  a: any,
): a is WritableAtom<AtomFormReturn<V>, [V], void> => a[atomFormSym] === true;

// prettier-ignore
export type ValuesTypeOf<AtomForm> =
  AtomForm extends WritableAtom<AtomFormReturn<infer Value>, any, any>
    ? Value
    : never;
