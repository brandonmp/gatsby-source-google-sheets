const fetchSheet = require(`./fetch-sheet.js`);
const normalize = require(`./normalize`);
const uuidv5 = require('uuid/v5');
const _ = require('lodash');

const seedConstant = '2972963f-2fcf-4567-9237-c09a2b436541';

exports.sourceNodes = async (
    { boundActionCreators, getNode, store, cache },
    { spreadsheetId, worksheetTitle, credentials }
) => {
    const { createNode } = boundActionCreators;

    let rows = await fetchData(targetSheetId, title, creds);

    rows.map(r =>
        createNode(
            Object.assign({
                r,
                id: uuidv5(r.id, uuidv5('gsheet', seedConstant)),
                parent: null,
                children: [],
                internal: {
                    type: _.camelCase(`googleSheet ${worksheetTitle} row`),
                    contentDigest: crypto
                        .createHash('md5')
                        .update(JSON.stringify(r))
                        .digest('hex')
                }
            })
        )
    );

    return;
};
