# gatsby-source-google-sheets

Why go through the hassle of setting up a complicated headless CMS when Google Sheets already has user permissions, revision history, and a powerful UI? 

This source plugin for [Gatsby JS](https://github.com/gatsbyjs/gatsby) will turn any Google Sheets worksheet into a GraphQL type for build-time consumption. 

## heads-up! 
Until [this issue in Gatsby](https://github.com/gatsbyjs/gatsby/issues/2727) is addressed, when this plugin fails, it will fail *silently*. Your build will still complete, but the data you were expecting to be available won't be there. 

I'll add `retry` to this plugin eventually, but this is a limitation of Gatsby's build that likely affects all source plugins.

# How to:

## Step 1: set up sheets/permissions

Follow this tutorial: https://www.twilio.com/blog/2017/03/google-spreadsheets-and-javascriptnode-js.html

...but stop just before the part that says "Read Data from a Spreadsheet with Node.js"

Essentially this creates a Google Sheets API for your project, then shares whichever spreadsheet you're looking to Gatsby-fy with that endpoint. 



## Step 2: configure your gatsby project

Standard source plugin installation.

```
yarn add gatsby-source-google-sheets


// gatsby-config.js
// ...
{
    resolve: 'gatsby-source-google-sheets',
    options: {
        spreadsheetId: 'get this from the sheet url',
        worksheetTitle: 'ie the name in the worksheet tab',
        credentials: require('./path-to-credentials-file.json')
    }
},
// ...

```

The plugin makes the following conversions before feeding Gatsby nodes:
1. Numbers are converted to numbers. Sheets formats numbers as comma-delineated strings, so to determine if something is a number, the plugin tests to see if the string (a) is non-empty and (b) is composed only of commas, decimals, and digits:
```
if (
    "value".replace(/[,\.\d]/g, "").length === 0 
      && "value" !== ""
   ) { 
    ...assume value is a number and handle accordingly
}
```
2. "TRUE"/"FALSE" converted to boolean true/false
3. empty cells ("" in sheets payload) converted to null
4. Column names are converted to camelcase via lodash _.camelCase() (see note 2 in 'A few notes')


A few notes:

1. Not tested with cells of data type dates.
2. Google sheets mangles column names and converts them all to lower case. This plugin will convert them to camelcase, so the best convention here is to name your columns all lowercase with dashes. e.g. instead of "Column Name 1" or "columnName1", prefer "column-name-1"--this last one will be turned into "columnName1" in your GatsbyQL graph. 
