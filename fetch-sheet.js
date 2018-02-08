'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GoogleSpreadsheet = require('google-spreadsheet');
const _ = require('lodash');

const getSpreadsheet = (spreadsheetId, credentials) => new Promise((resolve, reject) => {
    const doc = new GoogleSpreadsheet(spreadsheetId);
    doc.useServiceAccountAuth(credentials, function (err) {
        if (err) reject(err);else resolve(doc);
    });
});

const getWorksheetByTitle = (spreadsheet, worksheetTitle) => new Promise((resolve, reject) => spreadsheet.getInfo((e, s) => {
    if (e) reject(e);
    const targetSheet = s.worksheets.find(sheet => sheet.title === worksheetTitle);
    if (!targetSheet) {
        reject(`Found no worksheet with the title ${worksheetTitle}`);
    }
    resolve(targetSheet);
}));

const getRows = (worksheet, options = {}) => new Promise((resolve, reject) => worksheet.getRows(options, (err, rows) => {
    if (err) reject(err);else {
        resolve(rows.map(r =>
        // google sheets mangles column names, so we use a dash-lowercase convention
        // , and now we make that JS friendly w/ camelcase
        _.mapKeys(
        // system values we don't need
        _.omit(r, ['_xml', 'app:edited', 'save', 'del', '_links']), (val, key) => _.camelCase(key))));
    }
}));

const cleanRows = rows => rows.map(r => _.mapValues(r, val => {
    if (val === '') return null;
    // sheets apparently leaves commas in some #s depending on formatting
    if (!isNaN(val.replace(/[\W]/g, '')) && val !== '') {
        return Number(val.replace(/[\W]/g, ''));
    }
    if (val === 'TRUE') return true;
    if (val === 'FALSE') return false;
    return val;
}));

const fetchData = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (spreadsheetId, worksheetTitle, credentials) {
        const spreadsheet = yield getSpreadsheet(spreadsheetId, credentials);
        const worksheet = yield getWorksheetByTitle(spreadsheet, worksheetTitle);
        const rows = yield getRows(worksheet);
        return cleanRows(rows);
    });

    return function fetchData(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

module.exports = fetchData;