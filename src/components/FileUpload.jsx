import { useRef } from 'react';
export default function FileUpload({ onFileSelect, loading, jobCount, error }) {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <section className="card" aria-labelledby="upload-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="upload-heading" className="section-title">
          Upload Excel
        </h2>
        {jobCount > 0 && (
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
            {jobCount} jobs loaded
          </span>
        )}
      </div>

      <div
        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 px-4 py-10 transition hover:border-primary-400 hover:bg-primary-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleChange}
          disabled={loading}
          aria-label="Upload Excel file"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            <p className="text-sm font-medium text-primary-700">Reading Excel file…</p>
          </div>
        ) : (
          <>
            <svg
              className="mb-3 h-12 w-12 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-center text-sm font-semibold text-slate-700">
              Drag & drop your Excel file here
            </p>
            <p className="mt-1 text-center text-xs text-slate-500">
              or click to browse · .xlsx and .xls supported
            </p>
          </>
        )}
      </div>

      {error && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
    </section>
  );
}
