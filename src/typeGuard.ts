function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

function isObject<T>(propertyCheckers: {
  [K in keyof T]-?:
    | ((value: unknown) => boolean)
    | Array<(value: unknown) => boolean>;
}): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    return (Object.keys(propertyCheckers) as (keyof T)[]).every((key) => {
      const checker = propertyCheckers[key];
      const propertyValue = (value as T)[key];

      // checkerが配列の場合は、内部でcombineCheckersを実行
      if (Array.isArray(checker)) {
        return checker.some((fn) => fn(propertyValue));
      } else {
        return checker(propertyValue);
      }
    });
  };
}

function isArray<T>(
  itemChecker:
    | ((value: unknown) => boolean)
    | Array<(value: unknown) => boolean>
): (value: unknown) => value is T[] {
  return (value: unknown): value is T[] => {
    if (!Array.isArray(value)) {
      return false;
    }

    // itemCheckerが配列の場合は、内部でcombineCheckersを実行
    const combinedChecker = Array.isArray(itemChecker)
      ? (value: unknown) => itemChecker.some((fn) => fn(value))
      : itemChecker;

    return value.every((item) => combinedChecker(item));
  };
}

function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

function isNull(value: unknown): value is null {
  return value === null;
}

export {
  isBoolean,
  isNumber,
  isString,
  isDate,
  isObject,
  isArray,
  isUndefined,
  isNull,
};
