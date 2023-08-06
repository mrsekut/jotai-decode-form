import { useId } from 'react';
import { z } from 'zod';
import { useAtom } from 'jotai';

import { atomWithSchema, success } from 'jotai-decode-form';

import { DisplayInternalValue } from '../utils/DisplayInternalValues';
import { ErrorText } from '../utils/ErrorText';

type Theme = { mode: 'light' } | { mode: 'dark' };

type ThemeOption = z.infer<typeof ThemeOption>;
const ThemeOption = z.enum(['light mode', 'dark mode']);
const themeAtom = atomWithSchema<Theme, ThemeOption>({
  schema: {
    toView: theme => {
      switch (theme.mode) {
        case 'light':
          return 'light mode';
        case 'dark':
          return 'dark mode';
        default:
          throw new Error(`${theme satisfies never}`);
      }
    },
    fromView: value => {
      const parsed = ThemeOption.safeParse(value);
      if (!parsed.success) return parsed;

      switch (parsed.data) {
        case 'light mode':
          return success({ mode: 'light' });
        case 'dark mode':
          return success({ mode: 'dark' });
        default:
          throw new Error(`${parsed.data satisfies never}`);
      }
    },
  },
});

export const Field: React.FC = () => {
  const id = useId();
  const [field, onChange] = useAtom(themeAtom);

  return (
    <div className="field_wrap">
      <div className="field">
        <label htmlFor={id}>mode</label>
        <select
          id={id}
          value={field.exValue}
          onChange={e => onChange(e.target.value as ThemeOption)}
        >
          <option>light mode</option>
          <option>dark mode</option>
        </select>
      </div>

      {field.state.isDirty && field.state.error != null && (
        <ErrorText error={field.state.error} />
      )}

      <DisplayInternalValue value={field.value} />
    </div>
  );
};
