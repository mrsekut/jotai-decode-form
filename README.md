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
import { useAtom } from 'jotai';
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

## Additional Examples

For detailed implementations and more use cases, see [examples](https://github.com/mrsekut/jotai-decode-form/tree/main/examples).

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
