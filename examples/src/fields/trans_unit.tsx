import { useId } from 'react';
import { z } from 'zod';
import { useAtom } from 'jotai';

import { atomWithSchema } from 'jotai-decode-form';

import { NumberFromString } from '../utils/NumberFromString';
import { mm2cm, CM, cm2mm, MM } from '../utils/Unit';
import { DisplayInternalValue } from '../utils/DisplayInternalValues';
import { ErrorText } from '../utils/ErrorText';

const Height = z.number().min(0).max(1000).pipe(MM);
type Height = z.infer<typeof Height>;

const heightAtom = atomWithSchema<Height>({
  schema: {
    toView: mm => (mm == null ? '' : `${mm2cm(mm)}`),
    fromView: NumberFromString.pipe(CM).transform(cm2mm).pipe(Height).safeParse,
  },
});

export const Field: React.FC = () => {
  const id = useId();
  const [field, onChange] = useAtom(heightAtom);

  return (
    <div className="field_wrap">
      <div className="field">
        <label htmlFor={id}>height (cm)</label>
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
