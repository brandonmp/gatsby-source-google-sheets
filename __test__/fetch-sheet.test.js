"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("../fetch-sheet.js"),
    cleanRows = _require.cleanRows;

describe("cleaning rows from GSheets response", function () {
  it("removes keys that don't correspond to column names", function () {
    var badKeys = ["_xml", "app:edited", "save", "del", "_links"];
    var row = badKeys.reduce(function (prev, curr) {
      return (0, _extends3.default)({}, prev, {
        [curr]: "true"
      });
    }, { validKey: "true" });
    var cleaned = cleanRows([row])[0];
    expect(Object.keys(cleaned)).toHaveLength(1);

    expect(Object.keys(cleaned)[0]).toBe("validKey");
    expect(cleaned["validKey"]).toBe("true");
  });

  it('converts "TRUE" and "FALSE" into actual booleans', function () {
    var boolRow = { truthy: "TRUE", falsy: "FALSE" };
    var cleaned = cleanRows([boolRow])[0];
    expect(Object.keys(cleaned)).toEqual(["truthy", "falsy"]);
    expect(cleaned["truthy"]).toBe(true);
    expect(cleaned["falsy"]).toBe(false);
  });

  it("respects emoji", function () {
    var TEST_EMOJI_STRING = "🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑";
    var emojiRow = { emoji: TEST_EMOJI_STRING };
    var cleaned = cleanRows([emojiRow])[0];
    expect(cleaned.emoji).toEqual(TEST_EMOJI_STRING);
  });
  it("returns comma-delineated number strings as numbers", function () {
    var numRow = { short: "1", long: "123,456,789", decimal: "0.5912", mixed: "123,456.789" };
    var cleaned = cleanRows([numRow])[0];
    expect(Object.values(cleaned)).toEqual([1, 123456789, 0.5912, 123456.789]);
  });
});