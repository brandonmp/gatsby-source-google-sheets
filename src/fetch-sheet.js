// @flow
const GoogleSpreadsheet = require('google-spreadsheet');
const _ = require('lodash');

const getSpreadsheet = (spreadsheetId, credentials) =>
    new Promise((resolve, reject) => {
        const doc = new GoogleSpreadsheet(spreadsheetId);
        doc.useServiceAccountAuth(credentials, function(err) {
            if (err) reject(err);
            else resolve(doc);
        });
    });

const getWorksheetByTitle = (spreadsheet, worksheetTitle) =>
    new Promise((resolve, reject) =>
        spreadsheet.getInfo((e, s) => {
            if (e) reject(e);
            const targetSheet = s.worksheets.find(
                sheet => sheet.title === worksheetTitle
            );
            if (!targetSheet)
                reject(`Found no worksheet with the title ${worksheetTitle}`);
            resolve(targetSheet);
        })
    );

const getRows = (worksheet, options = {}) =>
    new Promise((resolve, reject) =>
        worksheet.getRows(options, (err, rows) => {
            if (err) reject(err);
            else
                resolve(
                    rows.map(r =>
                        // system values we don't need
                        _.omit(r, [
                            '_xml',
                            'app:edited',
                            'save',
                            'del',
                            '_links'
                        ])
                    )
                );
        })
    );

const cleanRows = rows =>
    rows.map(r =>
        _.mapValues(r, val => {
            if (val === '') return null;
            if (!isNaN(val) && val !== '') return Number(val);
            if (val === 'TRUE') return true;
            if (val === 'FALSE') return false;
            return val;
        })
    );

const fetchData = async (spreadsheetId, worksheetTitle, credentials) => {
    const spreadsheet = await getSpreadsheet(targetSheetId, creds);
    const worksheet = await getWorksheetByTitle(spreadsheet, worksheetTitle);
    const rows = await getRows(worksheet);
    return cleanRows(rows);
};

var creds = require('../service-account.json');

// Create a document object using the ID of the spreadsheet - obtained from its URL.

module.exports = fetchData;
