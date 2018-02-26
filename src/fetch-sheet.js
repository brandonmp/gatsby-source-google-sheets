// @flow
const GoogleSpreadsheet = require('google-spreadsheet')
const _ = require('lodash')
var isValid = require('date-fns/is_valid')

const getSpreadsheet = (spreadsheetId, credentials) =>
    new Promise((resolve, reject) => {
        const doc = new GoogleSpreadsheet(spreadsheetId)
        doc.useServiceAccountAuth(credentials, function(err) {
            if (err) reject(err)
            else resolve(doc)
        })
    })

const getWorksheetByTitle = (spreadsheet, worksheetTitle) =>
    new Promise((resolve, reject) =>
        spreadsheet.getInfo((e, s) => {
            if (e) reject(e)
            const targetSheet = s.worksheets.find(
                sheet => sheet.title === worksheetTitle
            )
            if (!targetSheet) {
                reject(`Found no worksheet with the title ${worksheetTitle}`)
            }
            resolve(targetSheet)
        })
    )

const getRows = (worksheet, options = {}) =>
    new Promise((resolve, reject) =>
        worksheet.getRows(options, (err, rows) => {
            if (err) reject(err)
            else {
                resolve(
                    rows.map(r =>
                        // google sheets mangles column names, so we use a dash-lowercase convention
                        // , and now we make that JS friendly w/ camelcase
                        _.mapKeys(
                            // system values we don't need
                            _.omit(r, [
                                '_xml',
                                'app:edited',
                                'save',
                                'del',
                                '_links'
                            ]),
                            (val, key) => _.camelCase(key)
                        )
                    )
                )
            }
        })
    )

const cleanRows = rows =>
    rows.map(r =>
        _.mapValues(r, (val, key) => {
            if (key === 'date') {
                if (val !== '' && isValid(new Date(val))) {
                    return unescape(encodeURIComponent(new Date(val)))
                }
            }
            if (val === '') return null
            // sheets apparently leaves commas in some #s depending on formatting
            if (
                !isNaN(val.replace(/[\W]/g, '')) &&
                val.replace(/[\W]/g, '') !== '' &&
                val !== ''
            ) {
                return unescape(
                    encodeURIComponent(Number(val.replace(/[\W]/g, '')))
                )
            }
            if (val === 'TRUE') return unescape(encodeURIComponent('true'))
            if (val === 'FALSE') return unescape(encodeURIComponent('false'))
            return unescape(encodeURIComponent(val))
        })
    )

const fetchData = async (spreadsheetId, worksheetTitle, credentials) => {
    const spreadsheet = await getSpreadsheet(spreadsheetId, credentials)
    const worksheet = await getWorksheetByTitle(spreadsheet, worksheetTitle)
    const rows = await getRows(worksheet)
    return cleanRows(rows)
}

module.exports = fetchData
