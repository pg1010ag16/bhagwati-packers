import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_SHEET_TAB,
  fetchJobsFromGoogleSheet,
  loadSavedSheetConfig,
  parseGoogleSheetsUrl,
  saveSheetConfig,
} from '../utils/googleSheets';

export default function GoogleSheetsConnect({
  onJobsLoaded,
  onError,
  loading,
  setLoading,
  jobCount,
}) {
  const saved = loadSavedSheetConfig();
  const [sheetUrl, setSheetUrl] = useState(saved.url);
  const [sheetTab, setSheetTab] = useState(saved.tab);
  const [lastLoaded, setLastLoaded] = useState(null);
  const initialLoad = useRef(false);

  const loadSheet = useCallback(
    async (url = sheetUrl, tab = sheetTab) => {
      onError('');
      setLoading(true);

      try {
        const { spreadsheetId } = parseGoogleSheetsUrl(url);
        const tabName = tab.trim() || DEFAULT_SHEET_TAB;
        saveSheetConfig(url, tabName);

        const jobs = await fetchJobsFromGoogleSheet(spreadsheetId, tabName);
        onJobsLoaded(jobs);
        setLastLoaded(new Date());
      } catch (err) {
        onJobsLoaded([]);
        onError(err.message || 'Failed to load Google Sheet.');
      } finally {
        setLoading(false);
      }
    },
    [onError, onJobsLoaded, setLoading, sheetTab, sheetUrl],
  );

  useEffect(() => {
    if (!initialLoad.current && saved.url) {
      initialLoad.current = true;
      loadSheet(saved.url, saved.tab);
    }
  }, [loadSheet, saved.tab, saved.url]);

  return (
    <section className="card border-brand-teal/20 bg-gradient-to-br from-white to-brand-teal/[0.04]" aria-labelledby="sheets-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="sheets-heading" className="section-title">
            Connect Google Sheets
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Load jobs directly from your &quot;Automatic Corrugated Box Tracking Sheet&quot;
          </p>
        </div>
        {jobCount > 0 && (
          <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
            {jobCount} jobs loaded
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="sheet-url" className="field-label">
            Google Sheets link
          </label>
          <input
            id="sheet-url"
            type="url"
            className="input-base"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="max-w-xs">
          <label htmlFor="sheet-tab" className="field-label">
            Tab name
          </label>
          <input
            id="sheet-tab"
            type="text"
            className="input-base"
            placeholder="Boxes"
            value={sheetTab}
            onChange={(e) => setSheetTab(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => loadSheet()}
            disabled={loading || !sheetUrl.trim()}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Loading…
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C7.58 4 4.01 7.58 4.01 12s3.57 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.65 2.65z" />
                </svg>
                {jobCount > 0 ? 'Refresh from Sheets' : 'Load from Sheets'}
              </>
            )}
          </button>
        </div>

        {lastLoaded && (
          <p className="text-xs text-slate-500">
            Last synced: {lastLoaded.toLocaleString('en-IN')}
          </p>
        )}

        <details className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-700">
            How to connect your sheet
          </summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Open your Google Sheet: <strong>Automatic Corrugated Box Tracking Sheet</strong></li>
            <li>Click <strong>Share</strong> → set to <strong>Anyone with the link</strong> → <strong>Viewer</strong></li>
            <li>Copy the URL from your browser and paste it above</li>
            <li>Keep tab name as <strong>Boxes</strong> (where your sizes are listed)</li>
            <li>Click <strong>Load from Sheets</strong> — your link is saved for next time</li>
          </ol>
        </details>
      </div>
    </section>
  );
}
