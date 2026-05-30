/** Display order for job details (matches corrugated box tracking sheet). */
export const JOB_DETAIL_FIELDS = [
  { key: 'customerName', label: 'Customer Name' },
  { key: 'boxName', label: 'Box Name' },
  { key: 'layers', label: 'Number of Layers' },
  { key: 'dimensions', label: 'Dimensions (L × W × H) MM' },
  { key: 'reelSize', label: 'Reel Size (Inch) W × Diameter' },
  { key: 'cutSize', label: 'Cut Size MM' },
  { key: 'paperBf', label: 'Paper BF' },
];

export const PAPER_GSM_FIELDS = [
  { key: 'paperGsmFace', label: 'Face' },
  { key: 'paperGsmFlute1', label: 'Flute' },
  { key: 'paperGsmKraft1', label: 'Kraft' },
  { key: 'paperGsmFlute2', label: 'Flute' },
  { key: 'paperGsmKraft2', label: 'Kraft' },
];

export const JOB_EXTRA_FIELDS = [
  { key: 'colorJob', label: 'Color Job (1/2/3/4/6)' },
  { key: 'boxId', label: 'Box ID' },
  { key: 'remarks', label: 'Remarks / Notes' },
  { key: 'proceedToManufacture', label: 'Proceed to Manufacture' },
];

export function hasPaperGsmValues(job) {
  return PAPER_GSM_FIELDS.some(({ key }) => job[key]);
}
