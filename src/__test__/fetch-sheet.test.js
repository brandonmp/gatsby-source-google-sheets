const { cleanRows, guessColumnsDataTypes } = require("../fetch-sheet.js");

describe("cleaning rows from GSheets response", () => {
  it("removes keys that don't correspond to column names", () => {
    const badKeys = ["_xml", "app:edited", "save", "del", "_links"];
    const row = badKeys.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: "true"
      }),
      { validKey: "true" }
    );
    const cleaned = cleanRows([row])[0];
    expect(Object.keys(cleaned)).toHaveLength(1);

    expect(Object.keys(cleaned)[0]).toBe("validKey");
    expect(cleaned["validKey"]).toBe("true");
  });

  it('converts "TRUE" and "FALSE" into actual booleans', () => {
    const boolRow = { truthy: "TRUE", falsy: "FALSE" };
    const cleaned = cleanRows([boolRow])[0];
    expect(Object.keys(cleaned)).toEqual(["truthy", "falsy"]);
    expect(cleaned["truthy"]).toBe(true);
    expect(cleaned["falsy"]).toBe(false);
  });

  it("respects emoji", () => {
    const TEST_EMOJI_STRING = "🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑";
    const emojiRow = { emoji: TEST_EMOJI_STRING };
    const cleaned = cleanRows([emojiRow])[0];
    expect(cleaned.emoji).toEqual(TEST_EMOJI_STRING);
  });
  
  it("returns comma-delineated number strings as numbers", () => {
    const numRow = { short: "1", long: "123,456,789", decimal: "0.5912", mixed: "123,456.789" };
    const cleaned = cleanRows([numRow])[0];
    expect(Object.values(cleaned)).toEqual([1, 123456789, 0.5912, 123456.789]);
  });

  it('parses cells as numbers when all column cells contains numbers only', function () {
    const rows = [
      { column: "5" },
      { column: "2" }
    ];
    const cleaned = cleanRows(rows);
    expect(cleaned[0].column).toBe(5);
    expect(cleaned[1].column).toBe(2);
  });

  it('parses all cells in column as strings when data types are mixed in given column', function () {
    const rows = [
      { column: "5"},
      { column: "hello" }
    ];
    const cleaned = cleanRows(rows);
    expect(cleaned[0].column).toBe("5");
    expect(cleaned[1].column).toBe("hello");
  });

  it('guesses column types', function () {
    const rows = [
      { number: "0", string: "something", null: null, boolean: "TRUE" },
      { number: "1", string: "anything", null: null, boolean: "FALSE" },
      { number: "2", string: "nothing", null: null, boolean: null }
    ];
    const cleaned = cleanRows(rows);
    expect(cleaned.map(row => row.number)).toEqual([0,1,2]);
    expect(cleaned.map(row => row.string)).toEqual(["something", "anything", "nothing"]);
    expect(cleaned.map(row => row.null)).toEqual([null, null, null]);
    expect(cleaned.map(row => row.boolean)).toEqual([true, false, null]);
  });
});

describe("guessing column data type based on all cells in column", () => {
  it('recognizes type for all same cells', function () {
    const rows = [
      { numbers: "1,", strings: "something", nulls: null, booleans: "TRUE" },
      { numbers: "2", strings: "anything", nulls: null, booleans: "FALSE" },
      { numbers: "3,", strings: "nothing", nulls: null, booleans: "TRUE" }
    ];
    const guessedTypes = guessColumnsDataTypes(rows);
    expect(guessedTypes.numbers).toBe('number');
    expect(guessedTypes.strings).toBe('string');
    expect(guessedTypes.nulls).toBeUndefined();
    expect(guessedTypes.booleans).toBe('boolean');
  });
  
  it('ignores null', function () {
    const rows = [
      { numbers: "1,", strings: "something", nulls: null, booleans: null },
      { numbers: null, strings: "anything", nulls: null, booleans: "FALSE" },
      { numbers: "3,", strings: null, nulls: null, booleans: "TRUE" }
    ];
    const guessedTypes = guessColumnsDataTypes(rows);
    expect(guessedTypes.numbers).toBe('number');
    expect(guessedTypes.strings).toBe('string');
    expect(guessedTypes.nulls).toBeUndefined();
    expect(guessedTypes.booleans).toBe('boolean');
  });

  it('fallbacks to string when types are different', function () {
    const rows = [
      { numbers: "1,", strings: "something", nulls: null, booleans: "TRUE" },
      { numbers: "2", strings: "anything", nulls: null, booleans: "FALSE" },
      { numbers: "3/5,", strings: "nothing", nulls: null, booleans: "TRUE" }
    ];
    const guessedTypes = guessColumnsDataTypes(rows);
    expect(guessedTypes.numbers).toBe('string');
    expect(guessedTypes.strings).toBe('string');
    expect(guessedTypes.nulls).toBeUndefined();
    expect(guessedTypes.booleans).toBe('boolean');
  });  
});