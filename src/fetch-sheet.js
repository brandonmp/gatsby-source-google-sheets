// @flow
const GoogleSpreadsheet = require("google-spreadsheet");
const _ = require("lodash");

const getSpreadsheet = (spreadsheetId, credentials) =>
  new Promise((resolve, reject) => {
    const doc = new GoogleSpreadsheet(spreadsheetId);

    if (!credentials) {
      return resolve(doc);
    }
    
    doc.useServiceAccountAuth(credentials, function(err) {
      if (err) reject(err);
      else resolve(doc);
    });
  });

const getWorksheetByTitle = (spreadsheet, worksheetTitle) =>
  new Promise((resolve, reject) =>
    spreadsheet.getInfo((e, s) => {
      if (e) reject(e);
      const targetSheet = s.worksheets.find(sheet => sheet.title === worksheetTitle);
      if (!targetSheet) {
        reject(`Found no worksheet with the title ${worksheetTitle}`);
      }
      resolve(targetSheet);
    })
  );

const getRows = (worksheet, options = {}) =>
  new Promise((resolve, reject) =>
    worksheet.getRows(options, (err, rows) => {
      if (err) reject(err);
      else {
        resolve(rows);
      }
    })
  );

const cleanRows = rows =>
  rows.map(r =>
    _.chain(r)
      .omit(["_xml", "app:edited", "save", "del", "_links"])
      .mapKeys((v, k) => _.camelCase(k))
      .mapValues(val => {
        if (val === "") return null;
        // sheets apparently leaves commas in some #s depending on formatting
        if (val.replace(/[,\.\d]/g, "").length === 0 && val !== "") {
          return Number(val.replace(/,/g, ""));
        }
        if (val === "TRUE") return true;
        if (val === "FALSE") return false;
        return val;
      })
      .value()
  );

const fetchData = async (spreadsheetId, worksheetTitle, credentials) => {
  const spreadsheet = await getSpreadsheet(spreadsheetId, credentials);
  const worksheet = await getWorksheetByTitle(spreadsheet, worksheetTitle);
  const rows = await getRows(worksheet);
  return cleanRows(rows);
};

export { cleanRows };
export default fetchData;
