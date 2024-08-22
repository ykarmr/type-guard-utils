import {
  isBoolean,
  isNumber,
  isString,
  isDate,
  isObject,
  isArray,
  isUndefined,
  isNull,
} from '../typeGuard';

describe('Type Guards', () => {
  test('isBoolean', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean('true')).toBe(false);
    expect(isBoolean(0)).toBe(false);
  });

  test('isNumber', () => {
    expect(isNumber(123)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber('123')).toBe(false);
    expect(isNumber(NaN)).toBe(true); // NaNもnumberとして扱われる
  });

  test('isString', () => {
    expect(isString('test')).toBe(true);
    expect(isString('')).toBe(true);
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
  });

  test('isDate', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('invalid date'))).toBe(false);
    expect(isDate('2024-01-01')).toBe(false);
    expect(isDate(1234567890)).toBe(false);
  });

  test('isObject', () => {
    const checker = isObject<{ a: number; b: string }>({
      a: isNumber,
      b: isString,
    });
    expect(checker({ a: 1, b: 'test' })).toBe(true);
    expect(checker({ a: '1', b: 'test' })).toBe(false);
    expect(checker({ a: 1 })).toBe(false);
    expect(checker([])).toBe(false);
    expect(checker(null)).toBe(false);
  });

  test('isArray', () => {
    const checker = isArray<number>(isNumber);
    expect(checker([1, 2, 3])).toBe(true);
    expect(checker([1, '2', 3])).toBe(false);
    expect(checker('not an array')).toBe(false);
    expect(checker([])).toBe(true);
  });

  test('isUndefined', () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);
    expect(isUndefined('')).toBe(false);
  });

  test('isNull', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
    expect(isNull('')).toBe(false);
  });
});
describe('複雑な型ガードのテスト', () => {
  describe('isObjectのテスト', () => {
    const checker = isObject<{
      a: number;
      b: { c: string; d: boolean[] };
      e: { f: Date; g: { h: number }[] };
    }>({
      a: isNumber,
      b: isObject({
        c: isString,
        d: isArray(isBoolean),
      }),
      e: isObject({
        f: isDate,
        g: isArray(isObject({ h: isNumber })),
      }),
    });

    test('正常ケース: ネストされたオブジェクトと配列', () => {
      expect(
        checker({
          a: 1,
          b: { c: 'test', d: [true, false] },
          e: { f: new Date(), g: [{ h: 42 }] },
        })
      ).toBe(true);
    });

    test('異常ケース: プロパティb.cがstringでない', () => {
      expect(
        checker({
          a: 1,
          b: { c: 100, d: [true, false] },
          e: { f: new Date(), g: [{ h: 42 }] },
        })
      ).toBe(false);
    });

    test('異常ケース: プロパティe.fがDateでない', () => {
      expect(
        checker({
          a: 1,
          b: { c: 'test', d: [true, false] },
          e: { f: 'not a date', g: [{ h: 42 }] },
        })
      ).toBe(false);
    });

    test('異常ケース: プロパティg.hがnumberでない', () => {
      expect(
        checker({
          a: 1,
          b: { c: 'test', d: [true, false] },
          e: { f: new Date(), g: [{ h: 'not a number' }] },
        })
      ).toBe(false);
    });
  });

  describe('isArrayのテスト', () => {
    const checker = isArray<{
      x: number;
      y: { z: string[] };
    }>(
      isObject({
        x: isNumber,
        y: isObject({
          z: isArray(isString),
        }),
      })
    );

    test('正常ケース: ネストされたオブジェクトと配列', () => {
      expect(
        checker([
          { x: 1, y: { z: ['a', 'b'] } },
          { x: 2, y: { z: ['c', 'd'] } },
        ])
      ).toBe(true);
    });

    test('異常ケース: プロパティxがnumberでない', () => {
      expect(
        checker([
          { x: 'not a number', y: { z: ['a', 'b'] } },
          { x: 2, y: { z: ['c', 'd'] } },
        ])
      ).toBe(false);
    });

    test('異常ケース: プロパティy.zがstring配列でない', () => {
      expect(
        checker([
          { x: 1, y: { z: [1, 2] } },
          { x: 2, y: { z: ['c', 'd'] } },
        ])
      ).toBe(false);
    });

    test('異常ケース: プロパティyがnull', () => {
      expect(
        checker([
          { x: 1, y: null },
          { x: 2, y: { z: ['c', 'd'] } },
        ])
      ).toBe(false);
    });

    test('正常ケース: 配列が空', () => {
      expect(checker([])).toBe(true); // これは許容されるケース
    });
  });
});

describe('複雑な型ガードのテスト (combinedCheckerの利用)', () => {
  describe('isObjectのテスト with combinedChecker', () => {
    const checker = isObject<{
      a: number | string;
      b: boolean | Date;
    }>({
      a: [isNumber, isString],
      b: [isBoolean, isDate],
    });

    test('正常ケース: プロパティaがnumber、プロパティbがboolean', () => {
      expect(checker({ a: 123, b: true })).toBe(true);
    });

    test('正常ケース: プロパティaがstring、プロパティbがDate', () => {
      expect(checker({ a: 'text', b: new Date() })).toBe(true);
    });

    test('異常ケース: プロパティaがnumberでもstringでもない', () => {
      expect(checker({ a: null, b: true })).toBe(false);
    });

    test('異常ケース: プロパティbがbooleanでもDateでもない', () => {
      expect(checker({ a: 'text', b: 'not a boolean or date' })).toBe(false);
    });
  });

  describe('isArrayのテスト with combinedChecker', () => {
    const checker = isArray<number | string>([isNumber, isString]);

    test('正常ケース: 配列の各要素がnumberまたはstring', () => {
      expect(checker([1, 'two', 3, 'four'])).toBe(true);
    });

    test('異常ケース: 配列の一部の要素がnumberでもstringでもない', () => {
      expect(checker([1, 'two', {}, 'four'])).toBe(false);
    });

    test('正常ケース: 配列が空の場合', () => {
      expect(checker([])).toBe(true); // 空の配列は許容される
    });

    test('異常ケース: 配列そのものがArrayではない', () => {
      expect(checker('not an array')).toBe(false);
    });
  });
});
