const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Path to your service account JSON key file
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'path_to_your_service_account_key.json')));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Define your scope here (e.g., read/write)
});

const sheets = google.sheets({ version: 'v4', auth });

// Your Google Sheet ID (you can find it in the URL of the sheet)
const spreadsheetId = 'your_spreadsheet_id';

async function readSheet() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:B10', // Specify the range of data
  });
  console.log(res.data.values);
}

async function writeSheet() {
  const updateData = [
    ['A', 'B'],
    ['1', '2'],
  ];
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1!A1:B2',
    valueInputOption: 'RAW', // Or 'USER_ENTERED' depending on how you want to input the values
    requestBody: {
      values: updateData,
    },
  });
  console.log(res.data);
}

// Example usage
readSheet();
writeSheet();
