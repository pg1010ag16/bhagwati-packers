import * as XLSX from 'xlsx';
import { parseArrayRows } from './excelParser.js';

export function parseCsvToJobs(csvText) {
  const workbook = XLSX.read(csvText, { type: 'string', raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('The Google Sheet tab appears to be empty.');
  }

  const sheet = workbook.Sheets[sheetName];
  const arrayRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!arrayRows.length) {
    throw new Error('The Google Sheet tab appears to be empty.');
  }

  const jobs = parseArrayRows(arrayRows);
  if (!jobs.length) {
    throw new Error(
      'No valid job rows found on the Boxes tab. Check Customer Name and Box Name columns.',
    );
  }

  return jobs;
}

export async function fetchJobsFromGoogleSheet() {
  const response = await fetch('/api/sheets');

  if (!response.ok) {
    let message = 'Could not load Google Sheet.';
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // use default message
    }

    if (response.status === 403 || response.status === 404) {
      message =
        'Sheet not accessible. Share it as "Anyone with the link can view" and try again.';
    }

    throw new Error(message);
  }

  const csvText = await response.text();
  if (!csvText.trim()) {
    throw new Error('The Boxes tab returned no data.');
  }

  return parseCsvToJobs(csvText);
}
