import { WritableAtom } from 'jotai';

export type FieldResultAtom<Value> = WritableAtom<
  FieldResult<Value>,
  [Value],
  void
>;

export type FieldResult<Value> =
  | { isValid: false }
  | {
      isValid: true;
      value: Value;
    };
