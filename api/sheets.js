
const SPREADSHEET_ID = '1o6sIxENFGkZSx57GPaisKBUyL1Phtsa2_X6I_o4SN60';
const SHEET_GID = '568131174';

function buildGoogleCsvUrl() {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    const response = await fetch(buildGoogleCsvUrl());

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to fetch Google Sheet',
      });
    }

    const csv = await response.text();

    if (
      csv.includes('<!DOCTYPE html') ||
      csv.includes('<html')
    ) {
      return res.status(403).json({
        error:
          'Google Sheet must be shared as Anyone with the link → Viewer',
      });
    }

    res.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8'
    );

    res.setHeader(
      'Cache-Control',
      's-maxage=60, stale-while-revalidate=300'
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Failed to load Google Sheet',
    });
  }
}
// const DEFAULT_SHEET = 'Boxes';

// function buildGoogleCsvUrl(spreadsheetId, sheetName) {
//   const params = new URLSearchParams({
//     tqx: 'out:csv',
//     sheet: sheetName || DEFAULT_SHEET,
//   });
//   return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${params.toString()}`;
// }

// export default async function handler(req, res) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     return res.status(204).end();
//   }

//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   const spreadsheetId = req.query?.spreadsheetId;
//   const sheetName = req.query?.sheetName || DEFAULT_SHEET;

//   if (!spreadsheetId || !/^[a-zA-Z0-9-_]+$/.test(spreadsheetId)) {
//     return res.status(400).json({ error: 'Invalid spreadsheet ID.' });
//   }

//   try {
//     const googleUrl = buildGoogleCsvUrl(spreadsheetId, sheetName);
//     const response = await fetch(googleUrl, {
//       headers: { 'User-Agent': 'BhagwatiPackersJobSelector/1.0' },
//     });

//     if (!response.ok) {
//       return res.status(response.status).json({
//         error:
//           'Could not fetch Google Sheet. Ensure it is shared as "Anyone with the link can view".',
//       });
//     }

//     const csv = await response.text();

//     if (csv.includes('<!DOCTYPE html') || csv.includes('<html')) {
//       return res.status(403).json({
//         error:
//           'Sheet is not public. In Google Sheets: Share → General access → Anyone with the link → Viewer.',
//       });
//     }

//     res.setHeader('Content-Type', 'text/csv; charset=utf-8');
//     res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
//     return res.status(200).send(csv);
//   } catch {
//     return res.status(500).json({ error: 'Failed to load Google Sheet.' });
//   }
// }
