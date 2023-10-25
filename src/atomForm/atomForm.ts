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
): a is WritableAtom<AtomFormReturn<V>, [V], void> =>
  a != null && typeof a === 'object' && a[atomFormSym] === true;

// prettier-ignore
export type ValuesTypeOf<AtomForm> =
  AtomForm extends WritableAtom<AtomFormReturn<infer Value>, any, any>
    ? Value
    : never;

if (import.meta.vitest) {
  const { it, describe, expect } = import.meta.vitest;

  describe('isAtomForm function', () => {
    it('should return true for objects with atomFormSym set to true', () => {
      const testObj = { [atomFormSym]: true };
      expect(isAtomForm(testObj)).toBe(true);
    });

    it('should return false for objects without atomFormSym', () => {
      const testObj = { someKey: 'someValue' };
      expect(isAtomForm(testObj)).toBe(false);
    });

    it('should return false for objects with atomFormSym set to false', () => {
      const testObj = { [atomFormSym]: false };
      expect(isAtomForm(testObj)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isAtomForm(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isAtomForm(undefined)).toBe(false);
    });

    it('should return false for primitives', () => {
      expect(isAtomForm(123)).toBe(false);
      expect(isAtomForm('string')).toBe(false);
      expect(isAtomForm(true)).toBe(false);
    });
  });
}
