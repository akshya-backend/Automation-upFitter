// services/google.sheet.service.js
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const googleAuth = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};

const auth = new GoogleAuth({
  credentials: googleAuth,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function initSheet(requestId) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const sheetTitle = `Upfitters-${requestId}`;
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.SPREADSHEET_ID,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: sheetTitle,
            gridProperties: {
              rowCount: 2,
              columnCount: 8,
              frozenRowCount: 1
            }
          }
        }
      }]
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetTitle}!A1:H1`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        'Company', 'Website', 'Phone', 'Email', 
        'Address', 'owner','City', 'Description'
      ]]
    }
  });

  return sheetTitle;
}


async function appendResults(results, requestId) {
  const sheetTitle = `Upfitters-${requestId}`;

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const values = results.map(r => [
    r.name ?? 'N/A',
    r.website ?? 'N/A',
    r.phone ?? 'N/A',
    r.email ?? 'N/A',
    r.address ?? 'N/A',
    r.owner?? 'N/A',
    r.city ?? 'N/A',
    r.description ?? 'N/A'
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetTitle}!A:H`,
    valueInputOption: 'USER_ENTERED',
    resource: { values }
  });
}


module.exports = { initSheet, appendResults };
