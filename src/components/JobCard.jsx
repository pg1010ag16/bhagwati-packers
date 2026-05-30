import {
  JOB_DETAIL_FIELDS,
  JOB_EXTRA_FIELDS,
  PAPER_GSM_FIELDS,
  hasPaperGsmValues,
} from '../utils/jobFields';

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <p className="field-value break-words">{value || '—'}</p>
    </div>
  );
}

export default function JobCard({ job, index, onEditChange }) {
  const extraFields = JOB_EXTRA_FIELDS.filter(
    ({ key }) => job[key] && key !== 'remarks' && (key !== 'boxId' || !job.boxName),
  );

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
          {job.boxName && (
            <p className="mt-0.5 text-sm text-slate-600">{job.boxName}</p>
          )}
        </div>
        {job.layers && (
          <span className="shrink-0 rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-800">
            {job.layers}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {JOB_DETAIL_FIELDS.filter(({ key }) => key !== 'customerName' && key !== 'boxName').map(
          ({ key, label }) => (
            <ReadOnlyField key={key} label={label} value={job[key]} />
          ),
        )}
      </div>

      <div className="mt-4 rounded-xl border border-primary-100 bg-primary-50/60 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary-700">
          Paper Gsm
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PAPER_GSM_FIELDS.map(({ key, label }) => (
            <ReadOnlyField key={key} label={label} value={job[key]} />
          ))}
        </div>
        {!hasPaperGsmValues(job) && (
          <p className="mt-2 text-xs text-slate-500">No paper GSM values in this row.</p>
        )}
      </div>

      {extraFields.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {extraFields.map(({ key, label }) => (
            <ReadOnlyField key={key} label={label} value={job[key]} />
          ))}
        </div>
      )}

      {job.remarks && (
        <div className="mt-4">
          <ReadOnlyField label="Sheet Remarks (from Excel)" value={job.remarks} />
        </div>
      )}

      <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
        <div className="max-w-xs">
          <label htmlFor={`no-of-cuts-${job.id}`} className="field-label">
            No of Cuts
          </label>
          <input
            id={`no-of-cuts-${job.id}`}
            type="text"
            inputMode="numeric"
            className="input-base"
            placeholder="Enter number of cuts…"
            value={job.noOfCuts ?? ''}
            onChange={(e) => onEditChange('noOfCuts', e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">Shown on generated image when filled.</p>
        </div>

        <div>
          <label htmlFor={`job-remarks-${job.id}`} className="field-label">
            Remarks
          </label>
          <textarea
            id={`job-remarks-${job.id}`}
            className="input-base min-h-[88px] resize-y"
            placeholder="Enter remarks for this job…"
            value={job.editableRemarks ?? ''}
            onChange={(e) => onEditChange('editableRemarks', e.target.value)}
            rows={3}
          />
          <p className="mt-1 text-xs text-slate-500">Included on generated image when filled.</p>
        </div>
      </div>
    </article>
  );
}
