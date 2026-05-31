import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getGoogleSheetExportUrl } from './src/config/sheet.js';

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

        try {
          const response = await fetch(getGoogleSheetExportUrl());

          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'Could not fetch Google Sheet. Ensure it is shared publicly.',
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

export default defineConfig({
  plugins: [react(), sheetsApiPlugin()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
