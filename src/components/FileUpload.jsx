import { useRef } from 'react';

export default function FileUpload({ onFileSelect, loading, error, collapsed }) {
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

  const content = (
    <>
      <div
        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 transition hover:border-primary-300 hover:bg-slate-50"
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            <p className="text-sm font-medium text-primary-700">Reading Excel file…</p>
          </div>
        ) : (
          <>
            <p className="text-center text-sm font-medium text-slate-700">
              Drag & drop Excel here, or click to browse
            </p>
            <p className="mt-1 text-center text-xs text-slate-500">.xlsx and .xls</p>
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
    </>
  );

  if (collapsed) {
    return (
      <details className="card">
        <summary className="cursor-pointer section-title text-base">
          Or upload Excel file manually
        </summary>
        <div className="mt-4">{content}</div>
      </details>
    );
  }

  return (
    <section className="card" aria-labelledby="upload-heading">
      <h2 id="upload-heading" className="section-title mb-4">
        Upload Excel
      </h2>
      {content}
    </section>
  );
}
