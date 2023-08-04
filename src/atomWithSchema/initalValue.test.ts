import { describe, test, expect, expectTypeOf } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAtomValue } from 'jotai';
import { z } from 'zod';

import { atomWithSchema } from '.';

describe('types', () => {
  test('Value type matches the initial value type when specified', () => {
    const fieldAtom = atomWithSchema({
      initValue: 0,
    });
    const { result: field } = renderHook(() => useAtomValue(fieldAtom));

    expectTypeOf(field.current.value).toEqualTypeOf<number>();
  });

  test('Value is nullable when the initial value is not specified', () => {
    const fieldAtom = atomWithSchema<number>();
    const { result: field } = renderHook(() => useAtomValue(fieldAtom));

    expectTypeOf(field.current.value).toEqualTypeOf<number | null>();
  });
});

describe('When the initial value is null, exValue is an empty string', () => {
  test('without schema', () => {
    const fieldAtom = atomWithSchema<string>();
    const { result: field } = renderHook(() => useAtomValue(fieldAtom));

    expect(field.current.exValue).toBe('');
  });

  test('with schema', () => {
    const fieldAtom = atomWithSchema({
      schema: {
        toView: value => `${value}`,
        fromView: z.coerce.number().safeParse,
      },
    });
    const { result: field } = renderHook(() => useAtomValue(fieldAtom));

    expect(field.current.exValue).toBe('');
  });
});
