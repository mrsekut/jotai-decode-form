# Examples

## Installation and Run

```
$ npm i
$ npm run dev
```

## Examples

### case 1: No Conversion Required

- **Example Source**: [simple.tsx](https://github.com/mrsekut/jotai-decode-form/blob/main/examples/src/fields/simple.tsx)

- **Internal Data**: `string`

- **External Data**: `string`

When there's no need to convert data between internal and external representations, you can use the library without specifying any schema.

```typescript
type Name = string;
const nameAtom = atomWithSchema<Name>();
```

### case 2: Converting to a Number

- **Example Source**: [basic_number.tsx](https://github.com/mrsekut/jotai-decode-form/blob/main/examples/src/fields/basic_number.tsx)

- **Internal Data**: `number`

- **External Data**: `string`

Define and utilize custom transformers, such as `NumberFromString`, for the conversion process.

```typescript
const Age = z.number().min(0).max(100);
type Age = z.infer<typeof Age>;

const widthAtom = atomWithSchema<Age>({
  schema: {
    toView: String,
    fromView: NumberFromString.pipe(Age).safeParse,
  },
});
```

### case 3: Changing Numeric Units

- **Example Source**: [trans_unit.tsx](https://github.com/mrsekut/jotai-decode-form/blob/main/examples/src/fields/trans_unit.tsx)

- **Internal Data**: `MM`

- **External Data**: `CM`

Applications often require various units for user inputs. While a user might find it intuitive to use `cm` in some contexts and `mm` in others, internally, it's efficient to standardize one unit, such as `MM`, for seamless calculations.

```typescript
// Define MM
type MM = z.infer<typeof MM>;
const MM = z.number().brand<'MM'>();

// CM definition and conversion functions
const cm2mm = (cm: CM): MM => mkMM(cm * 10);
const mm2cm = (mm: MM): CM => mkCM(mm / 10);

const Height = z.number().min(0).max(1000).pipe(MM);
type Height = z.infer<typeof Height>;

const heightAtom = atomWithSchema<Height>({
  schema: {
    toView: mm => (mm == null ? '' : `${mm2cm(mm)}`),
    fromView: NumberFromString.pipe(CM).transform(cm2mm).pipe(Height).safeParse,
  },
});
```

- `fromView`: Transforms user input following the sequence: `string` → `number` → `CM` → `MM` → `Height`. So, an input of `100` cm is internally processed as `1000` mm.
- `toView`: transforms the internal `MM` value back to a user-friendly string in `CM`.

Note: An example with date conversions from UST to JST can be found [here](https://github.com/mrsekut/jotai-decode-form/blob/main/examples/src/fields/date.tsx).

### case 4: Different Select Option Representations

- **Example Source**: [select.tsx](https://github.com/mrsekut/jotai-decode-form/blob/main/examples/src/fields/select.tsx)

- **Internal Data**: `Theme`

- **External Data**: `ThemeOption`

For cases where you want a more user-friendly select option representation.

```typescript
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
```
