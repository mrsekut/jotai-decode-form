import { test, expect, expectTypeOf, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { z } from 'zod';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

import { atomWithSchema } from '../atomWithSchema';
import { atomForm } from '.';
import { ValuesTypeOf } from './atomForm';

test.todo(
  'when valid input is provided, the entire form values can be obtained',
  () => {
    const field1Atom = atomWithSchema({
      schema: {
        toView: String,
        fromView: z.coerce.number().safeParse,
      },
    });
    const field2Atom = atomWithSchema({ initValue: '1' });

    const formAtom = atomForm(({ getField }) => ({
      field1: getField(field1Atom),
      field2: getField(field2Atom),
    }));

    const { result: setField1 } = renderHook(() => useSetAtom(field1Atom));
    const { result: form } = renderHook(() => useAtomValue(formAtom));

    act(() => {
      setField1.current('1'); // valid input
    });

    expect(form.current).toStrictEqual({
      isValid: true,
      values: { field1: 1, field2: '1' },
    });
  },
);

test.todo('when there is a validation error, isValid becomes false', () => {
  const fieldAtom = atomWithSchema({
    schema: {
      toView: String,
      fromView: z.coerce.number().safeParse,
    },
  });
  const formAtom = atomForm(({ getField }) => ({ field: getField(fieldAtom) }));

  const { result: setField } = renderHook(() => useSetAtom(fieldAtom));
  const { result: form } = renderHook(() => useAtomValue(formAtom));

  act(() => {
    setField.current('a'); // invalid input
  });

  expect(form.current.isValid).toStrictEqual(false);
});

test.todo('atomForm is writable', () => {
  const field1Atom = atom(0);
  const field2Atom = atomWithSchema<number>({
    schema: {
      toView: String,
      fromView: z.coerce.number().safeParse,
    },
  });
  const formAtom = atomForm(({ get, getField }) => ({
    field1: get(field1Atom),
    field2: getField(field2Atom),
  }));

  const { result: form } = renderHook(() => useAtom(formAtom));
  const { result: field } = renderHook(() => useAtom(field2Atom));

  act(() => {
    form.current[1]({
      field1: 1,
      field2: 1,
    });
  });

  expect(form.current[0]).toStrictEqual({
    isValid: true,
    values: {
      field1: 1,
      field2: 1,
    },
  });
  expect(field.current[0].value).toStrictEqual(1);
  expect(field.current[0].exValue).toStrictEqual('1');
});

describe.todo('type of atomForm', () => {
  test('values type should match with schema type', () => {
    const formAtom = atomForm(({ getField }) => ({
      field1: getField(atomWithSchema<number>()),
      field2: getField(atomWithSchema<{ type: number }>()),
    }));

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

  test('ValuesTypeOf type should match with schema type', () => {
    const formAtom = atomForm(({ getField, get, getForm }) => ({
      field1: getField(atomWithSchema<number>()),
      field2: getField(atomWithSchema<{ type: number }>()),
      field3: get(atom(1)),
      field4: getForm(
        atomForm(({ getField }) => ({
          field5: getField(atomWithSchema<number>()),
        })),
      ),
    }));

    type Values = ValuesTypeOf<typeof formAtom>;

    expectTypeOf<Values>().toEqualTypeOf<{
      field1: number;
      field2: { type: number };
      field3: number;
      field4: {
        field5: number;
      };
    }>();
  });
});
