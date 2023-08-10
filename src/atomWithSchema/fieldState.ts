// State
export type FieldState<Value> =
  | {
      isDirty: boolean;
      error: string;
    }
  | {
      isDirty: boolean;
      error: undefined;
      submitValue: Value;
    };

type FieldCondition = 'dirty' | 'pristine';

export function reducer(_: FieldCondition): FieldCondition {
  return 'dirty';
}
