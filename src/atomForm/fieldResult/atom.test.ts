import { test, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { atom, useAtom } from 'jotai';
import { atomForm, withAtomFormSym } from '../atomForm';

test('set and get with getAtom', () => {
  const fieldAtom = atom<string>('1');
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
