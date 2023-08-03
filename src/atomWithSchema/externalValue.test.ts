import { describe, test, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAtom } from 'jotai';
import { z } from 'zod';

import { atomWithSchema } from '.';

describe('Changing the external value updates the external value', () => {
  test('without schema', () => {
    const fieldAtom = atomWithSchema({
      initValue: 0,
    });
    const { result } = renderHook(() => useAtom(fieldAtom));

    expect(result.current[0].exValue).toBe('0');

    act(() => {
      result.current[1]('1');
    });

    expect(result.current[0].exValue).toBe('1');
  });

  test('with schema', () => {
    const fieldAtom = atomWithSchema({
      initValue: 0,
      schema: {
        i2e: value => `${value}`,
        e2i: z.coerce.number().safeParse,
      },
    });
    const { result: field } = renderHook(() => useAtom(fieldAtom));

    expect(field.current[0].exValue).toBe('0');

    act(() => {
      field.current[1]('1');
    });

    expect(field.current[0].exValue).toBe('1');
  });
});

test('An error can be confirmed when validation is not met', () => {
  const fieldAtom = atomWithSchema({
    initValue: 0,
    schema: {
      i2e: value => `${value}`,
      e2i: z.coerce.number().max(20).safeParse,
    },
  });
  const { result: field } = renderHook(() => useAtom(fieldAtom));

  expect(field.current[0].state.error).toBe(undefined);

  act(() => {
    field.current[1]('21');
  });

  expect(field.current[0].state.error).toBe(
    'Number must be less than or equal to 20',
  );
});

test('The internal value is also updated only when there are no errors', () => {
  const fieldAtom = atomWithSchema({
    initValue: 0,
    schema: {
      i2e: value => `${value}`,
      e2i: z.coerce.number().safeParse,
    },
  });
  const { result: field } = renderHook(() => useAtom(fieldAtom));

  expect(field.current[0].value).toBe(0);

  act(() => {
    field.current[1]('1');
  });

  expect(field.current[0].value).toBe(1);
});

test('If there is an error, the internal value will not be updated', () => {
  const fieldAtom = atomWithSchema({
    initValue: 0,
    schema: {
      i2e: String,
      e2i: z.coerce.number().safeParse,
    },
  });
  const { result: field } = renderHook(() => useAtom(fieldAtom));

  expect(field.current[0].value).toBe(0);

  act(() => {
    field.current[1]('a');
  });

  expect(field.current[0].value).toBe(0);
});
