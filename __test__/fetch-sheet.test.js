"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { cleanRows } = require("../fetch-sheet.js");

describe("cleaning rows from GSheets response", () => {
  it("removes keys that don't correspond to column names", () => {
    const badKeys = ["_xml", "app:edited", "save", "del", "_links"];
    const row = badKeys.reduce((prev, curr) => (0, _extends3.default)({}, prev, {
      [curr]: "true"
    }), { validKey: "true" });
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
});