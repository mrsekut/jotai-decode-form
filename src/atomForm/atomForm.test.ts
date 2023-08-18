import { test, expect, expectTypeOf } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { z } from 'zod';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

import { atomWithSchema } from '../atomWithSchema';
import { atomForm } from '.';

test('when valid input is provided, the entire form values can be obtained', () => {
  const field1Atom = atomWithSchema({
    schema: {
      toView: String,
      fromView: z.coerce.number().safeParse,
    },
  });
  const field2Atom = atomWithSchema({ initValue: '1' });

  const formAtom = atomForm({ field1: field1Atom, field2: field2Atom });

  const { result: setField1 } = renderHook(() => useSetAtom(field1Atom));
  const { result: form } = renderHook(() => useAtomValue(formAtom));

  act(() => {
    setField1.current('1'); // valid input
  });

  expect(form.current).toStrictEqual({
    isValid: true,
    values: { field1: 1, field2: '1' },
  });
});

test('when there is a validation error, isValid becomes false', () => {
  const fieldAtom = atomWithSchema({
    schema: {
      toView: String,
      fromView: z.coerce.number().safeParse,
    },
  });
  const formAtom = atomForm({ field: fieldAtom });

  const { result: setField } = renderHook(() => useSetAtom(fieldAtom));
  const { result: form } = renderHook(() => useAtomValue(formAtom));

  act(() => {
    setField.current('a'); // invalid input
  });

  expect(form.current.isValid).toStrictEqual(false);
});

test('atomForm is writable', () => {
  const fieldAtom = atomWithSchema<number>({
    schema: {
      toView: String,
      fromView: z.coerce.number().safeParse,
    },
  });
  const formAtom = atomForm({ field: fieldAtom });

  const { result: form } = renderHook(() => useAtom(formAtom));
  const { result: field } = renderHook(() => useAtom(fieldAtom));

  act(() => {
    form.current[1]({ field: 1 });
  });

  expect(form.current[0]).toStrictEqual({
    isValid: true,
    values: { field: 1 },
  });
  expect(field.current[0].value).toStrictEqual(1);
  expect(field.current[0].exValue).toStrictEqual('1');
});

test('values type should match with schema type', () => {
  const formAtom = atomForm({
    field1: atomWithSchema<number>(),
    field2: atomWithSchema<{ type: number }>(),
  });

  const { result: form } = renderHook(() => useAtomValue(formAtom));

  expectTypeOf(form.current).toEqualTypeOf<
    | {
        isValid: false;
      }
    | {
        isValid: true;
        values: {
          field1: number;
          field2: { type: number };
        };
      }
  >();
});

test('atomForm only accepts atoms defined with atomWithSchema as arguments', () => {
  const field1Atom = atomWithSchema<number>();
  const field2Atom = atom(1);

  // @ts-expect-error
  atomForm({ field1: field1Atom, field2: field2Atom });
});
