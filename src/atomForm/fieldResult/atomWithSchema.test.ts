import { test, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAtom } from 'jotai';
import { atomForm, withAtomFormSym } from '../atomForm';
import { atomWithSchema } from '../../atomWithSchema';

test('set and get with getField', () => {
  const fieldAtom = atomWithSchema<string>({
    initValue: '1',
  });
  const formAtom = atomForm(() => ({
    field: fieldAtom,
  }));

  const { result: form } = renderHook(() => useAtom(formAtom));

  act(() => {
    form.current[1]({
      field: '2',
    });
  });

  expect(form.current[0]).toStrictEqual(
    withAtomFormSym({
      isValid: true,
      values: {
        field: '2',
      },
    }),
  );
});
