const { cleanRows } = require("../fetch-sheet.js");
const _ = require("lodash");

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

  it("returns comma-delineated number strings as numbers", () => {
    const numRow = { short: "1", long: "123,456,789", decimal: "0.5912", mixed: "123,456.789" };
    const cleaned = cleanRows([numRow])[0];
    expect(Object.values(cleaned)).toEqual([1, 123456789, 0.5912, 123456.789]);
  });
});
