# gatsby-source-google-sheets

Why go through the hassle of setting up a complicated headless CMS when Google Sheets already has user permissions, revision history, and a powerful UI? 

This source plugin for [Gatsby JS](https://github.com/gatsbyjs/gatsby) will turn any Google Sheets worksheet into a GraphQL type for build-time consumption. 

# How to:

## Step 1: set up sheets/permissions

1. Create a [Google Service Account](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount) and download the credentials file.
1. Open your google sheet, click "File > Share..." and enter your service account's e-mail address (you can find it in the credentials file).


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

## Step 3: query your data

Assuming that your spreadsheet has the following content.

| type                             | content                                                                                                                                                                                                                                                                       |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  publication                     | Lynch, K., Schwerha, D., and Johanson, G. (2012). Development of a Weighted Heuristic for Website Evaluation for Older Adults. International Journal of Human Computer Interaction. Available online now at: http://www.tandfonline.com/doi/abs/10.1080/10447318.2012.715277. |
| journal-article--public-or-trade | Wiker, S., Schwerha, D., Jaraiedi, M. (2009). Auditory and Visual Distractor Decrement in Older Worker Manual Assembly Task Learning: Impact of Spatial Reasoning, Field Independence and Level of Education. 4. Human Factors and Ergonomics in Manufacturing; 19: 300-317.  |

where the first row is the names for the columns and they are required.

The following query can then be used.

```
query PublicationsQuery {
    allGoogleSheetPublicationsRow {
        edges {
            node {
                content
                type
            }
        }
    }
}
```

You can also access the [GraphiQL](https://www.gatsbyjs.org/docs/introducing-graphiql/) at [http://localhost:8000/___graphql](http://localhost:8000/___graphql) when Gatsby is in
development mode (`gatsby develop`). This IDE will allow you to design and try out the query.


# Notes

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

# Limitations

- The first row of the sheet has to be the names of the columns.
- There must be no empty rows in the sheet.

# Troubleshooting
3. If you get the error "No key or keyFile set", make sure you are using a Service Account API key and not a simple API key.
4. If you get the error "Cannot read property 'worksheets' of undefined", make sure you have shared your spreadsheet with your service account user.