import { WritableAtom, atom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';

export function atomWithSchema<
  Value,
  ExValue extends string = string,
>(): WritableAtom<AtomWithSchemaReturn<Value, ExValue, false>, [ExValue], void>;

export function atomWithSchema<
  Value,
  ExValue extends string = string,
>(options: {
  schema: Schema<Value, ExValue>;
}): WritableAtom<AtomWithSchemaReturn<Value, string, false>, [ExValue], void>;

export function atomWithSchema<
  Value,
  ExValue extends string = string,
>(options: {
  initValue: Value;
  schema?: Schema<Value, ExValue>;
}): WritableAtom<AtomWithSchemaReturn<Value, ExValue>, [ExValue], void>;

export function atomWithSchema<
  Value_,
  ExValue extends string = string,
>(options?: { initValue?: Value_; schema?: Schema<Value_, ExValue> }) {
  type Value = NonNullable<Value_> | null;

  const initValue = options?.initValue ?? null;
  const schema = options?.schema;

  const valueAtom = atom<Value>(initValue);
  const externalAtom = atom<ExValue>(i2e(initValue));
  const statusAtom = atomWithReducer('pristine', reducer);
  const validationAtom = atom(get => e2i(get(externalAtom)));

  const onChangeInValueAtom = atom(null, (_, set, newValue: Value) => {
    set(externalAtom, i2e(newValue));
    set(valueAtom, newValue);
  });

  const onChangeExValueAtom = atom(null, (get, set, newValue: ExValue) => {
    set(externalAtom, newValue);
    set(statusAtom, { type: 'change' });

    const result = get(validationAtom);
    if (result.success) {
      set(valueAtom, result.data as Value);
    }
  });

  const stateAtom = atom<State<Value_>>(get => {
    const result = get(validationAtom);
    const isDirty = get(statusAtom) === 'dirty';

    if (result.success) {
      return {
        isDirty,
        submitValue: result.data,
        error: undefined,
      };
    }

    return {
      isDirty,
      error: result.error.issues[0]?.message as string,
    };
  });

  function e2i(value: ExValue): ValidationResult<Value_> {
    if (schema == null) {
      return {
        success: true,
        data: value as unknown as Value_,
      };
    }

    return schema.e2i(value);
  }

  function i2e(value: Value): ExValue {
    if (value == null) {
      return '' as ExValue;
    }

    if (schema != null) {
      return schema.i2e(value);
    }

    return `${value}` as ExValue;
  }

  return atom(
    get => ({
      value: get(valueAtom),
      exValue: get(externalAtom),
      state: get(stateAtom),
      onChangeInValueAtom,
    }),
    (_, set, args: ExValue) => {
      set(onChangeExValueAtom, args);
    },
  );
}

// Return
type AtomWithSchemaReturn<
  Value,
  ExValue extends string = string,
  HasInit extends boolean = true,
> = {
  value: true extends HasInit ? Value : Value | null;
  exValue: ExValue;
  state: State<Value>;
  onChangeInValueAtom: WritableAtom<null, [newValue: Value], void>;
};

// State
type State<Value> =
  | {
      isDirty: boolean;
      error: string;
    }
  | {
      isDirty: boolean;
      error: undefined;
      submitValue: Value;
    };

// Schema
type Schema<In, Ex extends string = string> =
  | InternalOnly
  | WithExternal<In, Ex>;

type InternalOnly = undefined;
type WithExternal<In, Ex extends string = string> = {
  i2e: (internal: In) => Ex;
  e2i: (external: Ex) => ValidationResult<In>;
};

// Validation
type ValidationResult<Output> =
  | Success<Output>
  | { success: false; error: ZodError };

type ZodError = { issues: { message: string }[] };

type Success<Output> = { success: true; data: Output };

export const success = <Output>(data: Output): Success<Output> => ({
  success: true,
  data,
});

// Field Status
type FieldStatus = 'dirty' | 'pristine';

function reducer(_: FieldStatus): FieldStatus {
  return 'dirty';
}
