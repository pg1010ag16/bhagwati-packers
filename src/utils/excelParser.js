import * as XLSX from 'xlsx';

const COLUMN_ALIASES = {
  customerName: ['customer name', 'customer', 'client name', 'client'],
  boxName: ['box name', 'box'],
  boxId: ['box id', 'boxid', 'box no', 'box no.'],
  layers: [
    'number of layers',
    'number of layers (1,3,5,7)',
    'layers',
    'layer',
    'no of layers',
    'ply',
  ],
  dimensions: [
    'dimensions (l x w x h) in mm',
    'dimensions (l x w x h)',
    'dimensions',
    'dimension',
    'size',
  ],
  reelSize: [
    'reel size (inch) width x diameter',
    'reel size (inch)',
    'reel size',
    'reelsize',
    'reel',
  ],
  cutSize: ['cut size mm', 'cut size', 'cutsize'],
  paperBf: ['paper bf', 'paperbf', 'bf'],
  paperGsmFace: ['face', 'paper gsm face', 'gsm face'],
  colorJob: ['color job', 'color job (1/2/3/4/6)', 'color'],
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
    .replace(/\s+/g, ' ')
    .replace(/×/g, 'x');
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

function isSubHeaderRow(row) {
  const cells = rowToStrings(row).map(normalizeHeader);
  const hasFace = cells.some((c) => c === 'face' || c.startsWith('face '));
  const hasCustomer = cells.some((c) => c.includes('customer name'));
  return hasFace && !hasCustomer;
}

function findHeaderRowIndex(rows) {
  for (let i = 0; i < Math.min(rows.length, 10); i += 1) {
    const cells = rowToStrings(rows[i]).map(normalizeHeader);
    if (cells.some((c) => c.includes('customer name'))) {
      return i;
    }
  }
  return 0;
}

function buildCombinedHeaders(mainRow, subRow) {
  const main = rowToStrings(mainRow);
  const sub = subRow ? rowToStrings(subRow) : [];
  const maxLen = Math.max(main.length, sub.length);

  return Array.from({ length: maxLen }, (_, i) => {
    const mainH = normalizeHeader(main[i]);
    const subH = normalizeHeader(sub[i]);

    if (subH && (mainH.includes('paper gsm') || mainH === '' || isPaperGsmSubHeader(subH))) {
      return subH;
    }
    return mainH || subH;
  });
}

function isPaperGsmSubHeader(header) {
  return (
    header === 'face' ||
    header === 'flute' ||
    header === 'kraft' ||
    header.startsWith('face ') ||
    header.startsWith('flute ') ||
    header.startsWith('kraft ')
  );
}

function headerMatches(header, aliases) {
  return aliases.some(
    (alias) => header === alias || header.includes(alias) || alias.includes(header),
  );
}

function mapColumnsFromHeaders(headers) {
  const columnMap = {};
  let fluteIndex = 0;
  let kraftIndex = 0;

  headers.forEach((header, colIndex) => {
    if (!header) return;

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (field.startsWith('paperGsm')) continue;
      if (!columnMap[field] && headerMatches(header, aliases)) {
        columnMap[field] = colIndex;
        return;
      }
    }

    if (header === 'face' || header.startsWith('face ')) {
      columnMap.paperGsmFace = colIndex;
      return;
    }

    if (header === 'flute' || header.startsWith('flute ')) {
      fluteIndex += 1;
      columnMap[fluteIndex === 1 ? 'paperGsmFlute1' : 'paperGsmFlute2'] = colIndex;
      return;
    }

    if (header === 'kraft' || header.startsWith('kraft ')) {
      kraftIndex += 1;
      columnMap[kraftIndex === 1 ? 'paperGsmKraft1' : 'paperGsmKraft2'] = colIndex;
    }
  });

  return columnMap;
}

function mapColumnsFromJsonHeaders(headers) {
  const columnMap = {};
  const fluteKeys = [];
  const kraftKeys = [];

  for (const key of headers) {
    const header = normalizeHeader(key);

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (field.startsWith('paperGsm')) continue;
      if (!columnMap[field] && headerMatches(header, aliases)) {
        columnMap[field] = key;
      }
    }

    if (header === 'face' || header.startsWith('face')) {
      columnMap.paperGsmFace = key;
    } else if (header === 'flute' || header.startsWith('flute')) {
      fluteKeys.push(key);
    } else if (header === 'kraft' || header.startsWith('kraft')) {
      kraftKeys.push(key);
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

function parseFromArrayRows(rows) {
  const headerRowIdx = findHeaderRowIndex(rows);
  const hasSubHeader = isSubHeaderRow(rows[headerRowIdx + 1]);
  const combinedHeaders = buildCombinedHeaders(
    rows[headerRowIdx],
    hasSubHeader ? rows[headerRowIdx + 1] : null,
  );
  const columnMap = mapColumnsFromHeaders(combinedHeaders);
  const dataStart = headerRowIdx + (hasSubHeader ? 2 : 1);

  const jobs = [];
  for (let i = dataStart; i < rows.length; i += 1) {
    const row = rowToStrings(rows[i]);
    if (!rowHasData(row)) continue;

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

  let jobs = parseFromArrayRows(arrayRows);

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
