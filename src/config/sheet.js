/** Bhagwati Packers — Automatic Corrugated Box Tracking Sheet (Boxes tab) */
export const GOOGLE_SHEET = {
  spreadsheetId: '1o6sIxENFGkZSx57GPaisKBUyL1Phtsa2_X6I_o4SN60',
  gid: '568131174',
  tabName: 'Boxes',
  url: 'https://docs.google.com/spreadsheets/d/1o6sIxENFGkZSx57GPaisKBUyL1Phtsa2_X6I_o4SN60/edit?gid=568131174',
};

export function getGoogleSheetExportUrl() {
  return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET.spreadsheetId}/export?format=csv&gid=${GOOGLE_SHEET.gid}`;
}
