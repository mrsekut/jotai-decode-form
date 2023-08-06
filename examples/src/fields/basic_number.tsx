import { useId } from 'react';
import { useAtom } from 'jotai';
import { z } from 'zod';

import { atomWithSchema } from 'jotai-decode-form';

import { ErrorText } from '../utils/ErrorText';
import { NumberFromString } from '../utils/NumberFromString';
import { DisplayInternalValue } from '../utils/DisplayInternalValues';

const Age = z.number().min(0).max(100);
type Age = z.infer<typeof Age>;

const widthAtom = atomWithSchema<Age>({
  schema: {
    toView: String,
    fromView: NumberFromString.pipe(Age).safeParse,
  },
});

export const Field: React.FC = () => {
  const id = useId();
  const [field, onChange] = useAtom(widthAtom);

  return (
    <div className="field_wrap">
      <div className="field">
        <label htmlFor={id}>age</label>
        <input
          id={id}
          value={field.exValue}
          onChange={e => onChange(e.target.value)}
        />
      </div>

      {field.state.isDirty && field.state.error != null && (
        <ErrorText error={field.state.error} />
      )}

      <DisplayInternalValue value={field.value} />
    </div>
  );
};
