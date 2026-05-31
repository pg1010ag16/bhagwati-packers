import { getGoogleSheetExportUrl } from '../src/config/sheet.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(getGoogleSheetExportUrl(), {
      headers: { 'User-Agent': 'BhagwatiPackersJobSelector/1.0' },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Could not fetch Google Sheet. Ensure it is shared publicly.',
      });
    }

    const csv = await response.text();

    if (csv.includes('<!DOCTYPE html') || csv.includes('<html')) {
      return res.status(403).json({
        error:
          'Google Sheet must be shared: Share → Anyone with the link → Viewer.',
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load Google Sheet.' });
  }
}
