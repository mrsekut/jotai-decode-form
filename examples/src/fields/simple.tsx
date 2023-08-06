import { useId } from 'react';
import { useAtom } from 'jotai';
import { atomWithSchema } from 'jotai-decode-form';
import { ErrorText } from '../utils/ErrorText';

import { DisplayInternalValue } from '../utils/DisplayInternalValues';

type Name = string;
const nameAtom = atomWithSchema<Name>();

export const Field: React.FC = () => {
  const id = useId();
  const [field, onChange] = useAtom(nameAtom);

  return (
    <div className="field_wrap">
      <div className="field">
        <label htmlFor={id}>name</label>
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
