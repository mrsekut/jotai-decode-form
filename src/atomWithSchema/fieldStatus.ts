type FieldStatus = 'dirty' | 'pristine';

export function reducer(_: FieldStatus): FieldStatus {
  return 'dirty';
}
