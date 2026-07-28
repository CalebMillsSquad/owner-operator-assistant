export type SearchParamValue = string | string[] | undefined;
export type PageSearchParams = Promise<Record<string, SearchParamValue>>;

export function getSingleSearchParam(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function getEnumSearchParam<const TOptions extends readonly string[]>(
  options: TOptions,
  value: SearchParamValue,
) {
  const singleValue = getSingleSearchParam(value);

  return options.includes(singleValue as TOptions[number]) ? (singleValue as TOptions[number]) : undefined;
}
