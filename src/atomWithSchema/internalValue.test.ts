import { describe, test, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { z } from 'zod';

import { atomWithSchema } from '.';

describe('Updating the internal value also updates both internal and external values', () => {
  test('without schema', () => {
    const fieldAtom = atomWithSchema<string>({
      initValue: 'a',
    });
    const { result: field } = renderHook(() => useAtomValue(fieldAtom));
    const { result: onChange } = renderHook(() =>
      useSetAtom(field.current.onChangeInValueAtom),
    );

    expect(field.current.value).toBe('a');
    expect(field.current.exValue).toBe('a');

    act(() => {
      onChange.current('b');
    });

    expect(field.current.value).toBe('b');
    expect(field.current.exValue).toBe('b');
  });

  test('with schema', () => {
    const fieldAtom = atomWithSchema({
      initValue: 0,
      schema: {
        toView: value => `${value}`,
        fromView: z.number().safeParse,
      },
    });
    const { result: field } = renderHook(() => useAtomValue(fieldAtom));
    const { result: onChange } = renderHook(() =>
      useSetAtom(field.current.onChangeInValueAtom),
    );

    expect(field.current.value).toBe(0);
    expect(field.current.exValue).toBe('0');

    act(() => {
      onChange.current(1);
    });

    expect(field.current.value).toBe(1);
    expect(field.current.exValue).toBe('1');
  });
});
