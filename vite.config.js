import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_SHEET = 'Boxes';

function buildGoogleCsvUrl(spreadsheetId, sheetName) {
  const params = new URLSearchParams({
    tqx: 'out:csv',
    sheet: sheetName || DEFAULT_SHEET,
  });
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?${params.toString()}`;
}

function sheetsApiPlugin() {
  return {
    name: 'sheets-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/sheets', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const url = new URL(req.url, 'http://localhost');
        const spreadsheetId = url.searchParams.get('spreadsheetId');
        const sheetName = url.searchParams.get('sheetName') || DEFAULT_SHEET;

        if (!spreadsheetId || !/^[a-zA-Z0-9-_]+$/.test(spreadsheetId)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid spreadsheet ID.' }));
          return;
        }

        try {
          const googleUrl = buildGoogleCsvUrl(spreadsheetId, sheetName);
          const response = await fetch(googleUrl);

          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error:
                  'Could not fetch Google Sheet. Ensure it is shared as "Anyone with the link can view".',
              }),
            );
            return;
          }

          const csv = await response.text();

          if (csv.includes('<!DOCTYPE html') || csv.includes('<html')) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error:
                  'Sheet is not public. Share → Anyone with the link → Viewer.',
              }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.end(csv);
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to load Google Sheet.' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sheetsApiPlugin()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
