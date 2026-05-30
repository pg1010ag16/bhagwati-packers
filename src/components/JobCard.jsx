function ReadOnlyField({ label, value }) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <p className="field-value break-words">{value || '—'}</p>
    </div>
  );
}

export default function JobCard({ job, index }) {
  return (
    <article
      className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
      aria-label={`Job ${index + 1}: ${job.customerName || job.boxName}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Job #{index + 1}
          </span>
          <h3 className="mt-0.5 text-base font-semibold text-slate-900">
            {job.customerName || '—'}
          </h3>
        </div>
        {job.boxId && (
          <span className="shrink-0 rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-800">
            ID: {job.boxId}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ReadOnlyField label="Box Name" value={job.boxName} />
        <ReadOnlyField label="Box ID" value={job.boxId} />
        <ReadOnlyField label="Dimensions" value={job.dimensions} />
        <ReadOnlyField label="Layers" value={job.layers} />
        <ReadOnlyField label="Reel Size" value={job.reelSize} />
        <ReadOnlyField label="Proceed to Manufacture" value={job.proceedToManufacture} />
        <div className="sm:col-span-2 lg:col-span-3">
          <ReadOnlyField label="Remarks / Notes" value={job.remarks} />
        </div>
      </div>
    </article>
  );
}
