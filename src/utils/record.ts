export const recordValueMap = <K extends string, V, R>(
  r: Record<K, V>,
  f: (v: V) => R,
): Record<K, R> => {
  return Object.fromEntries(
    Object.entries(r).map(([k, v]) => [k, f(v)]),
  ) as Record<K, R>;
};
