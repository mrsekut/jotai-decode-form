import { test, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAtom } from 'jotai';
import { atomWithSchema } from '../../atomWithSchema';
import { atomForm } from '../atomForm';

test('set and get with getForm', () => {
  const fieldAtom = atomWithSchema<string>();
  const formAtom = atomForm(({ getField }) => ({
    field: getField(fieldAtom),
  }));

  const formAtom2 = atomForm(({ getForm }) => ({
    field2: getForm(formAtom),
  }));

  const { result: form } = renderHook(() => useAtom(formAtom2));

  act(() => {
    form.current[1]({
      field2: {
        field: '1',
      },
    });
  });

  expect(form.current[0]).toStrictEqual({
    isValid: true,
    values: {
      field2: {
        field: '1',
      },
    },
  });
});
