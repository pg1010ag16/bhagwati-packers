import * as XLSX from 'xlsx';

const COLUMN_ALIASES = {
  customerName: ['customer name', 'customer', 'client name', 'client'],
  boxName: ['box name', 'box'],
  boxId: ['box id', 'boxid', 'id', 'box no', 'box no.'],
  dimensions: ['dimensions', 'dimension', 'size', 'dim'],
  layers: ['layers', 'layer', 'no of layers', 'no. of layers'],
  reelSize: ['reel size', 'reelsize', 'reel'],
  remarks: ['remarks', 'notes', 'remark', 'note', 'remarks/notes'],
  proceedToManufacture: [
    'proceed to manufacture',
    'proceed',
    'manufacture',
    'proceed to mfg',
  ],
};

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function findColumnKey(headers, aliases) {
  const normalizedHeaders = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const index = normalizedHeaders.indexOf(alias);
    if (index !== -1) return headers[index];
  }
  for (let i = 0; i < headers.length; i += 1) {
    const header = normalizedHeaders[i];
    if (aliases.some((alias) => header.includes(alias) || alias.includes(header))) {
      return headers[i];
    }
  }
  return null;
}

function cellValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : String(value);
  }
  return String(value).trim();
}

export function parseExcelFile(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('No sheets found in the Excel file.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rows.length) {
    throw new Error('The Excel sheet is empty.');
  }

  const headers = Object.keys(rows[0]);
  const columnMap = {};
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    columnMap[field] = findColumnKey(headers, aliases);
  }

  const jobs = rows
    .map((row, index) => {
      const get = (field) => {
        const key = columnMap[field];
        return key ? cellValue(row[key]) : '';
      };

      const customerName = get('customerName');
      const boxName = get('boxName');
      const boxId = get('boxId');

      if (!customerName && !boxName && !boxId) {
        return null;
      }

      return {
        id: `job-${index}-${boxId || boxName || customerName}`.replace(/\s+/g, '-'),
        customerName,
        boxName,
        boxId,
        dimensions: get('dimensions'),
        layers: get('layers'),
        reelSize: get('reelSize'),
        remarks: get('remarks'),
        proceedToManufacture: get('proceedToManufacture'),
      };
    })
    .filter(Boolean);

  if (!jobs.length) {
    throw new Error(
      'No valid job rows found. Ensure columns include Customer Name, Box Name, or Box ID.',
    );
  }

  return jobs;
}

export const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls'];

export function isValidExcelFile(file) {
  if (!file) return false;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}
