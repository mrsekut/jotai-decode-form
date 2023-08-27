import { type WritableAtom, Getter } from 'jotai';
import { isAtomForm } from '../atomForm';
import { isAtomWithSchema } from '../../atomWithSchema/atomWithSchema';

import * as A from './atom';
import * as S from './atomWithSchema';
import * as F from './atomForm';
import { FieldResultAtom } from './types';

type WritableAtom_<V> = WritableAtom<V, [unknown], unknown>;

export const toFieldResultAtom =
  (get: Getter) =>
  <AtomFields extends Record<string, WritableAtom_<any>>>(
    fields: AtomFields,
  ) => {
    type FieldResults = {
      [K in keyof AtomFields]: AtomFields[K] extends WritableAtom_<infer V>
        ? FieldResultAtom<V>
        : never;
    };

    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => {
        const a = get(v);

        if (isAtomForm(a)) {
          return [k, F.toFieldResultAtom(v)];
        }
        if (isAtomWithSchema(a)) {
          return [k, S.toFieldResultAtom(v)];
        }
        return [k, A.toFieldResultAtom(v)];
      }),
    ) as FieldResults;
  };

// prettier-ignore
export type PickByValues<F> = {
  [K in keyof F]:
      F[K] extends F.AtomFormReturnAtom<infer V>       ? V
    : F[K] extends S.AtomWithSchemaReturnAtom<infer V> ? V
    : F[K] extends A.AtomReturnAtom<infer V>           ? V
    : never;
};
