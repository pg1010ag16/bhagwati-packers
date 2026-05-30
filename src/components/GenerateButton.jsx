import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import ImageExportCard from './ImageExportCard';
import { formatDownloadFilename } from '../utils/dateHelpers';

export default function GenerateButton({
  selectedJobs,
  jobDate,
  customRemarks,
  disabled,
}) {
  const exportRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!exportRef.current || selectedJobs.length === 0) return;

    setGenerating(true);
    setError('');

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = formatDownloadFilename(jobDate);
      link.href = dataUrl;
      link.click();
    } catch {
      setError('Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <section className="card" aria-labelledby="generate-heading">
        <h2 id="generate-heading" className="section-title mb-4">
          Generate & Download
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Creates a high-quality PNG with Bhagwati Packers branding, job details, date, and
          your custom remarks.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
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
              Generating…
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
              Download Job Sheet Image
            </>
          )}
        </button>
      </section>

      {/* Off-screen render target for html2canvas */}
      <div
        className="pointer-events-none fixed left-[-9999px] top-0 overflow-hidden"
        aria-hidden
      >
        <div ref={exportRef}>
          <ImageExportCard
            jobDate={jobDate}
            customRemarks={customRemarks}
            selectedJobs={selectedJobs}
          />
        </div>
      </div>
    </>
  );
}
