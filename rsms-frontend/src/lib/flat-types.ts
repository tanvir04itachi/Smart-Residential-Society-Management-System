const DEFAULT_FLAT_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'];

export function getFlatTypeOptions(values: Array<string | null | undefined> = []) {
  return Array.from(
    new Set(
      [...DEFAULT_FLAT_TYPES, ...values]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).map((value) => ({ value, label: value }));
}
