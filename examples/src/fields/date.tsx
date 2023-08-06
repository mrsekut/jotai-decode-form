import { useId } from 'react';
import { useAtom } from 'jotai';

import { atomWithSchema } from 'jotai-decode-form';

import { DisplayInternalValue } from '../utils/DisplayInternalValues';
import { ErrorText } from '../utils/ErrorText';
import {
  UTC,
  toJSTFormat,
  datetimeLocalJST2UTC,
  DatetimeLocalJST,
} from '../utils/date';

const dateAtom = atomWithSchema<UTC>({
  schema: {
    toView: utc => toJSTFormat(utc, 'YYYY-MM-DD HH:mm'),
    fromView: DatetimeLocalJST.transform(datetimeLocalJST2UTC).safeParse,
  },
});

export const Field: React.FC = () => {
  const id = useId();
  const [field, onChange] = useAtom(dateAtom);

  return (
    <div className="field_wrap">
      <div className="field">
        <label htmlFor={id}>date (JST)</label>
        <input
          id={id}
          type="datetime-local"
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
