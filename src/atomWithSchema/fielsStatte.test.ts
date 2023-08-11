import { describe, test, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAtom } from 'jotai';
import { z } from 'zod';

import { atomWithSchema } from '.';

describe('Changing the external value sets isDirty to true', () => {
  test('without Schema', () => {
    const fieldAtom = atomWithSchema({
      initValue: '0',
    });
    const { result: field } = renderHook(() => useAtom(fieldAtom));

    expect(field.current[0].state.isDirty).toBe(false);

    act(() => {
      field.current[1]('1');
    });

    expect(field.current[0].state.isDirty).toBe(true);
  });

  test('with schema', () => {
    const fieldAtom = atomWithSchema<number>({
      initValue: 0,
      schema: {
        toView: value => `${value}`,
        fromView: z.coerce.number().safeParse,
      },
    });
    const { result: field } = renderHook(() => useAtom(fieldAtom));

    expect(field.current[0].state.isDirty).toBe(false);

    act(() => {
      field.current[1]('1');
    });

    expect(field.current[0].state.isDirty).toBe(true);
  });
});
