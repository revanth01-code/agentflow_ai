const { requestWithRetry } = require('./baseIntegration');

async function appendRow(token, spreadsheetId, range, values) {
  // TODO: Append the values to the sheet range with valueInputOption=USER_ENTERED.
  throw new Error('Google Sheets appendRow is not implemented yet');
}

module.exports = { appendRow };
