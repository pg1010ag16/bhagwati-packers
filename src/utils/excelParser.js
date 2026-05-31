import * as XLSX from 'xlsx';

const COLUMN_ALIASES = {
  customerName: ['customer name', 'customer', 'client name', 'client'],
  boxName: ['box name', 'box'],
  boxId: ['box id', 'boxid', 'box no', 'box no.'],
  layers: [
    'number of layers (1,3,5,7)',
    'number of layers',
    '(1,3,5,7)',
    'layers',
    'layer',
    'no of layers',
    'ply',
  ],
  dimensions: [
    'dimensions (l x w x h) in mm',
    '(l x w x h) in mm',
    'dimensions (l x w x h)',
    'dimensions',
    'dimension',
  ],
  reelSize: [
    'reel size (inch) width x diameter',
    'width x diameter',
    'reel size (inch)',
    'reel size',
    'reelsize',
  ],
  cutSize: ['cut size mm', 'cut size', 'cutsize'],
  paperBf: ['paper bf', 'paperbf'],
  colorJob: ['color job (1/2/3/4/6)', 'color job', '(1/2/3/4/6)', 'color'],
  remarks: ['remarks/notes', 'remarks', 'notes', 'remark', 'note'],
  proceedToManufacture: [
    'is proceed to manufacture',
    'proceed to manufacture',
    'proceed to mfg',
  ],
};

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/×/g, 'x')
    .replace(/[₹()]/g, (m) => (m === '₹' ? '' : m))
    .replace(/\s+/g, ' ')
    .trim();
}

function cellValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : String(value);
  }
  return String(value).trim();
}

function rowToStrings(row) {
  return (row || []).map((cell) => cellValue(cell));
}

function padRows(rows) {
  const maxLen = rows.reduce((max, row) => Math.max(max, (row || []).length), 0);
  return rows.map((row) => {
    const cells = rowToStrings(row);
    while (cells.length < maxLen) cells.push('');
    return cells;
  });
}

function findHeaderRowIndex(rows) {
  for (let i = 0; i < Math.min(rows.length, 15); i += 1) {
    const cells = rowToStrings(rows[i]).map(normalizeHeader);
    if (cells.some((c) => c.includes('customer name'))) {
      return i;
    }
  }
  return 0;
}

function isSubHeaderRow(row) {
  const cells = rowToStrings(row).map(normalizeHeader);
  if (cells.some((c) => c.includes('customer name'))) return false;

  return cells.some(
    (c) =>
      c.includes('paper bf') ||
      c === 'face' ||
      c.startsWith('face ') ||
      c.includes('1,3,5,7') ||
      c.includes('width x diameter') ||
      c === 'mm',
  );
}

function headerMatches(header, aliases) {
  if (!header) return false;
  return aliases.some((alias) => {
    if (header === alias) return true;
    if (header.includes(alias)) return true;
    if (alias.length > 4 && alias.includes(header)) return true;
    return false;
  });
}

function assignField(columnMap, field, colIndex) {
  if (columnMap[field] === undefined) {
    columnMap[field] = colIndex;
  }
}

/** Map columns using main + sub header rows (corrugated tracking sheet layout). */
function mapColumnsFromHeaderRows(mainRow, subRow) {
  const main = rowToStrings(mainRow).map(normalizeHeader);
  const sub = subRow ? rowToStrings(subRow).map(normalizeHeader) : [];
  const maxLen = Math.max(main.length, sub.length);
  const columnMap = {};
  let fluteCount = 0;
  let kraftCount = 0;

  for (let i = 0; i < maxLen; i += 1) {
    const m = main[i] || '';
    const s = sub[i] || '';

    // --- Paper Gsm block: read from sub-row labels (most reliable) ---
    if (s.includes('paper bf') || m.includes('paper bf')) {
      assignField(columnMap, 'paperBf', i);
      continue;
    }
    if (s === 'face' || (s.startsWith('face') && !s.includes('flute'))) {
      assignField(columnMap, 'paperGsmFace', i);
      continue;
    }
    if (s === 'flute' || (s.startsWith('flute') && s.length < 12)) {
      fluteCount += 1;
      assignField(columnMap, fluteCount === 1 ? 'paperGsmFlute1' : 'paperGsmFlute2', i);
      continue;
    }
    if (s === 'kraft' || (s.startsWith('kraft') && s.length < 12)) {
      kraftCount += 1;
      assignField(columnMap, kraftCount === 1 ? 'paperGsmKraft1' : 'paperGsmKraft2', i);
      continue;
    }

    // --- Sub-row unit labels paired with main-row headers ---
    if (s.includes('1,3,5,7')) {
      assignField(columnMap, 'layers', i);
      continue;
    }
    if (s.includes('l x w x h') || s.includes('l x w x h in mm')) {
      assignField(columnMap, 'dimensions', i);
      continue;
    }
    if (s.includes('width x diameter')) {
      assignField(columnMap, 'reelSize', i);
      continue;
    }
    if (s === 'mm' && (m.includes('cut size') || main[i - 1]?.includes('cut size'))) {
      assignField(columnMap, 'cutSize', i);
      continue;
    }
    if (s.includes('1/2/3/4/6')) {
      assignField(columnMap, 'colorJob', i);
      continue;
    }

    // --- Main-row headers ---
    const combined = [m, s].filter(Boolean).join(' ').trim();

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (columnMap[field] !== undefined) continue;
      if (headerMatches(m, aliases) || headerMatches(combined, aliases)) {
        assignField(columnMap, field, i);
      }
    }
  }

  // Fallback: cut size column when main header is "cut size" on same col as data
  if (columnMap.cutSize === undefined) {
    const cutIdx = main.findIndex((h) => h.includes('cut size'));
    if (cutIdx !== -1) assignField(columnMap, 'cutSize', cutIdx);
  }

  return columnMap;
}

function mapColumnsFromJsonHeaders(headers) {
  const columnMap = {};
  const fluteKeys = [];
  const kraftKeys = [];

  for (const key of headers) {
    const header = normalizeHeader(key);

    if (header.includes('paper bf')) {
      columnMap.paperBf = key;
      continue;
    }
    if (header === 'face' || header.startsWith('face ')) {
      columnMap.paperGsmFace = key;
      continue;
    }
    if (header === 'flute' || header.startsWith('flute')) {
      fluteKeys.push(key);
      continue;
    }
    if (header === 'kraft' || header.startsWith('kraft')) {
      kraftKeys.push(key);
      continue;
    }

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (columnMap[field] !== undefined) continue;
      if (headerMatches(header, aliases)) {
        columnMap[field] = key;
      }
    }
  }

  if (fluteKeys[0]) columnMap.paperGsmFlute1 = fluteKeys[0];
  if (fluteKeys[1]) columnMap.paperGsmFlute2 = fluteKeys[1];
  if (kraftKeys[0]) columnMap.paperGsmKraft1 = kraftKeys[0];
  if (kraftKeys[1]) columnMap.paperGsmKraft2 = kraftKeys[1];

  return columnMap;
}

function rowHasData(values) {
  return values.some((v) => v !== '');
}

function isHeaderLikeRow(row) {
  const cells = row.map(normalizeHeader);
  return (
    cells.some((c) => c.includes('customer name')) ||
    cells.some((c) => c.includes('paper bf') && c.includes('face'))
  );
}

function buildJobFromRow(row, columnMap, index, useArrayRow) {
  const get = (field) => {
    const key = columnMap[field];
    if (key === undefined || key === null) return '';
    return useArrayRow ? cellValue(row[key]) : cellValue(row[key]);
  };

  const customerName = get('customerName');
  const boxName = get('boxName');
  const boxId = get('boxId');

  if (!customerName && !boxName && !boxId) {
    return null;
  }

  const slug = [customerName, boxName, boxId, index]
    .filter(Boolean)
    .join('-')
    .replace(/\s+/g, '-')
    .slice(0, 80);

  return {
    id: `job-${index}-${slug}`,
    customerName,
    boxName,
    boxId,
    layers: get('layers'),
    dimensions: get('dimensions'),
    reelSize: get('reelSize'),
    cutSize: get('cutSize'),
    paperBf: get('paperBf'),
    paperGsmFace: get('paperGsmFace'),
    paperGsmFlute1: get('paperGsmFlute1'),
    paperGsmKraft1: get('paperGsmKraft1'),
    paperGsmFlute2: get('paperGsmFlute2'),
    paperGsmKraft2: get('paperGsmKraft2'),
    colorJob: get('colorJob'),
    remarks: get('remarks'),
    proceedToManufacture: get('proceedToManufacture'),
  };
}

export function parseArrayRows(rows) {
  const padded = padRows(rows);
  const headerRowIdx = findHeaderRowIndex(padded);
  const subRow = padded[headerRowIdx + 1];
  const hasSubHeader = subRow && isSubHeaderRow(subRow);
  const columnMap = mapColumnsFromHeaderRows(
    padded[headerRowIdx],
    hasSubHeader ? subRow : null,
  );
  const dataStart = headerRowIdx + (hasSubHeader ? 2 : 1);

  const jobs = [];
  for (let i = dataStart; i < padded.length; i += 1) {
    const row = rowToStrings(padded[i]);
    if (!rowHasData(row) || isHeaderLikeRow(row.map(normalizeHeader))) continue;

    const job = buildJobFromRow(row, columnMap, i, true);
    if (job) jobs.push(job);
  }

  return jobs;
}

function parseFromJsonRows(rows) {
  const headers = Object.keys(rows[0]);
  const columnMap = mapColumnsFromJsonHeaders(headers);

  return rows
    .map((row, index) => buildJobFromRow(row, columnMap, index, false))
    .filter(Boolean);
}

export function parseExcelFile(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('No sheets found in the Excel file.');
  }

  const sheet = workbook.Sheets[sheetName];
  const arrayRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!arrayRows.length) {
    throw new Error('The Excel sheet is empty.');
  }

  let jobs = parseArrayRows(arrayRows);

  if (!jobs.length) {
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (jsonRows.length) {
      jobs = parseFromJsonRows(jsonRows);
    }
  }

  if (!jobs.length) {
    throw new Error(
      'No valid job rows found. Ensure the sheet has Customer Name and Box Name columns.',
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
