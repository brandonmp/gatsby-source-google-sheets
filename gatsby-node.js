"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetchSheet = require(`./fetch-sheet.js`).default;
var uuidv5 = require("uuid/v5");
var _ = require("lodash");
var crypto = require("crypto");
var seedConstant = "2972963f-2fcf-4567-9237-c09a2b436541";

exports.sourceNodes = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref, _ref2) {
    var boundActionCreators = _ref.boundActionCreators,
        getNode = _ref.getNode,
        store = _ref.store,
        cache = _ref.cache;
    var spreadsheetId = _ref2.spreadsheetId,
        worksheetTitle = _ref2.worksheetTitle,
        credentials = _ref2.credentials;
    var createNode, rows;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNode = boundActionCreators.createNode;

            console.log("FETCHING SHEET", fetchSheet);
            _context.next = 4;
            return fetchSheet(spreadsheetId, worksheetTitle, credentials);

          case 4:
            rows = _context.sent;


            rows.forEach(function (r) {
              createNode(Object.assign(r, {
                id: uuidv5(r.id, uuidv5("gsheet", seedConstant)),
                parent: "__SOURCE__",
                children: [],
                internal: {
                  type: _.camelCase(`googleSheet ${worksheetTitle} row`),
                  contentDigest: crypto.createHash("md5").update(JSON.stringify(r)).digest("hex")
                }
              }));
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}();