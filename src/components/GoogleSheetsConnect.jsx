import { useCallback, useEffect, useRef, useState } from 'react';
import { GOOGLE_SHEET } from '../config/sheet';
import { fetchJobsFromGoogleSheet } from '../utils/googleSheets';

export default function GoogleSheetsConnect({
  onJobsLoaded,
  onError,
  loading,
  setLoading,
  jobCount,
}) {
  const [lastLoaded, setLastLoaded] = useState(null);
  const initialLoad = useRef(false);

  const loadSheet = useCallback(async () => {
    onError('');
    setLoading(true);

    try {
      const jobs = await fetchJobsFromGoogleSheet();
      onJobsLoaded(jobs);
      setLastLoaded(new Date());
    } catch (err) {
      onJobsLoaded([]);
      onError(err.message || 'Failed to load Google Sheet.');
    } finally {
      setLoading(false);
    }
  }, [onError, onJobsLoaded, setLoading]);

  useEffect(() => {
    if (!initialLoad.current) {
      initialLoad.current = true;
      loadSheet();
    }
  }, [loadSheet]);

  return (
    <section
      className="card border-brand-teal/20 bg-gradient-to-br from-white to-brand-teal/[0.04]"
      aria-labelledby="sheets-heading"
      aria-busy={loading}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="sheets-heading" className="section-title">
            Job Database
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Loaded automatically from{' '}
            <strong className="font-medium text-slate-700">{GOOGLE_SHEET.tabName}</strong>{' '}
            tab · Automatic Corrugated Box Tracking Sheet
          </p>
        </div>

        {loading ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-teal/30 border-t-brand-teal" />
            Syncing…
          </span>
        ) : jobCount > 0 ? (
          <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
            {jobCount} jobs ready
          </span>
        ) : null}
      </div>

      {loading && jobCount === 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-brand-teal/20 bg-white/80 px-4 py-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-teal/20 border-t-brand-teal" />
          <p className="text-sm font-medium text-slate-700">
            Fetching jobs from Google Sheets…
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={loadSheet}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh jobs'}
        </button>

        {lastLoaded && !loading && (
          <p className="text-xs text-slate-500">
            Last synced: {lastLoaded.toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </section>
  );
}
