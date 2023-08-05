# jotai-decode-form

[[Japanese](https://scrapbox.io/mrsekut-p/jotai-decode-form)]

jotai-decode-form is a library designed for defining forms using [Jotai](https://github.com/pmndrs/jotai). It aims to strictly separate the data structures of the application's internal and external environments.

## Installation

```
$ npm i jotai-decode-form jotai
```

## Motivation and Basic Usage

The primary goal of this library is to convert data types at the boundary of the program's external interface, adhering to specific specifications. Specifically, when implementing a form, we want to:

1. Manage the data structures of the internal and external separately.
2. Convert data mutually at the boundary (form) between the internal and external.

For instance, consider defining a field like `width` using standard Jotai to allow numeric input:

```typescript
import { useAtom, atom } from 'jotai';

const widthAtom = atom();

const Field: React.FC = () => {
  const [value, onChange] = useAtom(widthAtom);

  return (
    <>
      <label htmlFor="width">width</label>
      <input
        id="width"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </>
  );
};
```

In this scenario, we'd like to treat `width` internally as a `number`. However, with the current implementation, it's treated as a `string`. This issue is not unique to our library but is also prevalent in other form libraries.

Ideally, we'd want to handle `string` in the external world (field) and `number` internally. To achieve this, we can redefine the above atom using `atomWithSchema` provided by `jotai-decode-form`:

```typescript
import { atomWithSchema } from 'jotai-decode-form';
import { useAtom, useAtomValue } from 'jotai';
import { z } from 'zod';

type Width = number;

const widthAtom = atomWithSchema<Width>({
  schema: {
    fromView: z.coerce.number().safeParse,
    toView: String,
  },
});
```

Here, `fromView` specifies a function to convert from `string` to the internal data structure, which also serves as validation. In this example, we're using a function that forcibly converts to a number. Conversely, `toView` specifies a function to convert from the internal data structure to a `string`.

Using this new atom definition, you can access it using `useAtom` just like a regular atom:

```typescript
const Field: React.FC = () => {
  const [field, onChange] = useAtom(widthAtom);

  return (
    <>
      <label htmlFor="width">width</label>
      <input
        id="width"
        value={field.exValue}
        onChange={e => onChange(e.target.value)}
      />
    </>
  );
};
```

Furthermore, when referencing the internal value, you'll get the expected `number` type:

```typescript
const field = useAtomValue(widthAtom);
console.log(field.value); // 100
console.log(typeof field.value); // number
```

## Additional Use Cases

### No Conversion Needed

If there's no need for conversion between the internal (`string`) and external (`string`), you can use the library without specifying a Schema:

```typescript
type Name = number;
const nameAtom = atomWithSchema<Name>();
```

If validation is required, you can incorporate a validation function similar to the previous example:

```typescript
const Name = z.string().min(1).max(10);
type Name = z.infer<typeof Name>;

const nameAtom = atomWithSchema<Name>({
  schema: {
    toView: String,
    fromView: Name.safeParse,
  },
});
```

### Converting to Number

If you need to convert to a number, you can use helper types like `NumberFromString`:

```typescript
const NumberFromString = z
  .string()
  .regex(/^[+-]?\d*\.?\d+$/, { message: 'Please enter a number' });

// Usage:
const Width = z.number().min(0).max(1000);
type Width = z.infer<typeof Width>;

const widthAtom = atomWithSchema<Width>({
  schema: {
    toView: String,
    fromView: NumberFromString.pipe(Width).safeParse,
  },
});
```

### Changing Numeric Units

Consider an application that handles multiple units. From a user's perspective, depending on the context, `cm` might be appropriate in some cases, while `mm` in others. However, internally, for calculations, you'd want a unified unit. For instance, you might want to handle `MM` internally but use `CM` for the width field in the UI.

You can define such types using branded types and provide conversion functions:

```typescript
// MM definition
type MM = z.infer<typeof MM>;
const MM = z.number().brand<'MM'>();
const mkMM = (mm: number): MM => MM.parse(mm);

// CM definition
// ...

// CM definition and conversion functions
const cm2mm = (cm: CM): MM => mkMM(cm * 10);
const mm2cm = (mm: MM): CM => mkCM(mm / 10);

// Using mkMM for Width definition
const Width = z.number().min(0).max(1000).transform(mkMM);
type Width = z.infer<typeof Width>;

// Defining the width field
const widthAtom = atomWithSchema<Width>({
  schema: {
    toView: mm => (mm == null ? '' : `${mm2cm(mm)}`),
    fromView: NumberFromString.pipe(CM).transform(cm2mm).pipe(Width).safeParse,
  },
});
```

### Different Display Options

For instance, if you have an internal type for themes:

```typescript
type Theme = { mode: 'light' } | { mode: 'dark' };
```

But on the UI, you want user-friendly options in a select box:

```typescript
type ThemeOption = z.infer<typeof ThemeOption>;
const ThemeOption = z.enum(['Light Mode', 'Dark Mode']);
```

You can define conversion processes between the internal `Theme` and external `ThemeOption`:

```typescript
const themeAtom = atomWithSchema<Theme, ThemeOption>({
  schema: {
    toView: (theme: Theme) => {
      switch (theme.mode) {
        case 'light':
          return 'Light Mode';
        case 'dark':
          return 'Dark Mode';
        default:
          throw new Error(`${theme satisfies never}`);
      }
    },
    fromView: (value: ThemeOption) => {
      const parsed = ThemeOption.safeParse(value);
      if (!parsed.success) return parsed;

      switch (parsed.data) {
        case 'Light Mode':
          return { mode: 'light' };
        case 'Dark Mode':
          return { mode: 'dark' };
        default:
          throw new Error(`${parsed.data satisfies never}`);
      }
    },
  },
});
```

## Type Safety with Initial Values

With `atomWithSchema`, you can specify an initial value:

```typescript
const widthAtom = atomWithSchema<Width>({
  initValue: 100,
});
```

Whether you've specified an initial value determines if the internal value (`value`) type is nullable. If there's an initial value, it's of type `T`. Without an initial value, it's `T | null`. This ensures type safety as handling becomes mandatory when there's no initial value.

## Contributing

Welcome

## LICENSE

MIT
