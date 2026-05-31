import * as XLSX from 'xlsx';
import { parseArrayRows } from './excelParser';

export const DEFAULT_SHEET_TAB = 'Boxes';
export const STORAGE_KEY_URL = 'bhagwati-google-sheets-url';
export const STORAGE_KEY_TAB = 'bhagwati-google-sheets-tab';

export function parseGoogleSheetsUrl(input) {
  const trimmed = String(input ?? '').trim();
  if (!trimmed) {
    throw new Error('Please paste your Google Sheets link.');
  }

  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error(
      'Invalid Google Sheets URL. Copy the link from your browser address bar.',
    );
  }

  return { spreadsheetId: match[1] };
}

export function buildSheetsApiUrl(spreadsheetId, sheetName = DEFAULT_SHEET_TAB) {
  const params = new URLSearchParams({
    spreadsheetId,
    sheetName: sheetName || DEFAULT_SHEET_TAB,
  });
  return `/api/sheets?${params.toString()}`;
}

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
      'No valid job rows found. Check that the "Boxes" tab has Customer Name and Box Name columns.',
    );
  }

  return jobs;
}

export async function fetchJobsFromGoogleSheet(spreadsheetId, sheetName = DEFAULT_SHEET_TAB) {
  const apiUrl = buildSheetsApiUrl(spreadsheetId, sheetName);
  const response = await fetch(apiUrl);

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
    throw new Error('The Google Sheet tab returned no data.');
  }

  return parseCsvToJobs(csvText);
}

export function loadSavedSheetConfig() {
  if (typeof window === 'undefined') {
    return { url: '', tab: DEFAULT_SHEET_TAB };
  }
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) ?? '',
    tab: localStorage.getItem(STORAGE_KEY_TAB) ?? DEFAULT_SHEET_TAB,
  };
}

export function saveSheetConfig(url, tab) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_TAB, tab.trim() || DEFAULT_SHEET_TAB);
}
