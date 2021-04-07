const fetchSheet = require(`./fetch-sheet.js`).default;
const uuidv5 = require("uuid/v5");
const _ = require("lodash");
const crypto = require("crypto");
const seedConstant = "2972963f-2fcf-4567-9237-c09a2b436541";

exports.sourceNodes = async (
  { boundActionCreators, actions, getNode, store, cache },
  { spreadsheetId, worksheetTitle, credentials }
) => {
  const { createNode } = boundActionCreators || actions;
  console.log("FETCHING SHEET", fetchSheet);
  let rows = await fetchSheet(spreadsheetId, worksheetTitle, credentials);

  rows.forEach(r => {
    createNode(
      Object.assign(r, {
        id: uuidv5(r.id, uuidv5("gsheet", seedConstant)),
        parent: "__SOURCE__",
        children: [],
        internal: {
          type: _.camelCase(`googleSheet ${worksheetTitle} row`),
          contentDigest: crypto
            .createHash("md5")
            .update(JSON.stringify(r))
            .digest("hex")
        }
      })
    );
  });
};
