import { useRef, useState } from 'react';
import ImageExportCard from './ImageExportCard';
import { formatDownloadFilename } from '../utils/dateHelpers';
import {
  EXPORT_FORMATS,
  captureExportElement,
  downloadPdfFromContainer,
  downloadPng,
} from '../utils/exportDocument';

export default function GenerateButton({
  selectedJobs,
  jobDate,
  disabled,
}) {
  const exportRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('pdf');

  const handleGenerate = async () => {
    if (!exportRef.current || selectedJobs.length === 0) return;

    setGenerating(true);
    setError('');

    try {
      const canvas = await captureExportElement(exportRef.current);
      const filename = formatDownloadFilename(
        jobDate,
        format === 'pdf' ? 'pdf' : 'png',
      );

      if (format === 'pdf') {
        await downloadPdfFromContainer(exportRef.current, filename);
      } else {
        downloadPng(canvas, filename);
      }
    } catch {
      setError(`Failed to generate ${format === 'pdf' ? 'PDF' : 'image'}. Please try again.`);
    } finally {
      setGenerating(false);
    }
  };

  const selectedFormat = EXPORT_FORMATS.find((f) => f.id === format);

  return (
    <>
      <section className="card" aria-labelledby="generate-heading">
        <h2 id="generate-heading" className="section-title mb-4">
          Generate & Download
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Export a manufacturing job sheet with Bhagwati Packers branding, job details, per-job
          remarks, and no. of cuts (when filled).
        </p>

        <fieldset className="mb-5">
          <legend className="field-label mb-3">Download format</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {EXPORT_FORMATS.map((option) => {
              const isSelected = format === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer flex-col rounded-xl border-2 p-4 transition ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="export-format"
                      value={option.id}
                      checked={isSelected}
                      onChange={() => setFormat(option.id)}
                      className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                    {option.id === 'pdf' && (
                      <span className="rounded-full bg-brand-teal/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-teal">
                        Recommended
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 pl-6 text-xs text-slate-500">{option.description}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <div
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          onClick={handleGenerate}
          disabled={disabled || generating || selectedJobs.length === 0}
        >
          {generating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Generating {format === 'pdf' ? 'PDF' : 'PNG'}…
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download {selectedFormat?.label ?? 'File'}
            </>
          )}
        </button>
      </section>

      <div
        className="pointer-events-none fixed left-[-9999px] top-0 overflow-hidden"
        aria-hidden
      >
        <div ref={exportRef}>
          <ImageExportCard jobDate={jobDate} selectedJobs={selectedJobs} />
        </div>
      </div>
    </>
  );
}
