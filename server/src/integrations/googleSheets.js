const { requestWithRetry } = require('./baseIntegration');

async function appendRow(token, spreadsheetId, range = 'Sheet1!A1', values = []) {
  if (!spreadsheetId) throw new Error('Spreadsheet ID is required');
  const rowData = Array.isArray(values[0]) ? values : [values];
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  return requestWithRetry({
    method: 'POST',
    url,
    token,
    data: { values: rowData }
  });
}

module.exports = { appendRow };
