import { useCallback, useState } from 'react';
import Header from '../components/Header';
import GoogleSheetsConnect from '../components/GoogleSheetsConnect';
import FileUpload from '../components/FileUpload';
import JobSearch from '../components/JobSearch';
import JobCard from '../components/JobCard';
import GenerateButton from '../components/GenerateButton';
import { isValidExcelFile, parseExcelFile } from '../utils/excelParser';
import { parseInputDate, toInputDateValue } from '../utils/dateHelpers';
import { applyEditsToJobs } from '../utils/jobEdits';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [jobEdits, setJobEdits] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [jobDate, setJobDate] = useState(() => toInputDateValue(new Date()));

  const resetJobState = useCallback(() => {
    setJobs([]);
    setSelectedJobs([]);
    setJobEdits({});
  }, []);

  const handleJobsLoaded = useCallback((parsed) => {
    setJobs(parsed);
    setSelectedJobs([]);
    setJobEdits({});
    if (parsed.length > 0) {
      setDataError('');
    }
  }, []);

  const handleFileSelect = useCallback(async (file) => {
    setDataError('');

    if (!isValidExcelFile(file)) {
      setDataError('Invalid file type. Please upload a .xlsx or .xls file.');
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseExcelFile(buffer);
      handleJobsLoaded(parsed);
    } catch (err) {
      resetJobState();
      setDataError(err.message || 'Failed to read the Excel file.');
    } finally {
      setLoading(false);
    }
  }, [handleJobsLoaded, resetJobState]);

  const handleSelectionChange = useCallback(
    (jobsFromSelect) => {
      setSelectedJobs(applyEditsToJobs(jobsFromSelect, jobEdits));
    },
    [jobEdits],
  );

  const updateJobField = useCallback((jobId, field, value) => {
    setJobEdits((prev) => ({
      ...prev,
      [jobId]: {
        editableRemarks: prev[jobId]?.editableRemarks ?? '',
        noOfCuts: prev[jobId]?.noOfCuts ?? '',
        ...prev[jobId],
        [field]: value,
      },
    }));
    setSelectedJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, [field]: value } : job)),
    );
  }, []);

  const handleClearSelection = () => {
    setSelectedJobs([]);
  };

  const parsedJobDate = parseInputDate(jobDate);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <GoogleSheetsConnect
          onJobsLoaded={handleJobsLoaded}
          onError={setDataError}
          loading={loading}
          setLoading={setLoading}
          jobCount={jobs.length}
        />

        {dataError && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {dataError}
          </div>
        )}

        <FileUpload
          onFileSelect={handleFileSelect}
          loading={loading}
          error=""
          collapsed
        />

        <JobSearch
          jobs={jobs}
          selectedJobs={selectedJobs}
          onSelectionChange={handleSelectionChange}
          disabled={loading || !jobs.length}
        />

        <section className="card" aria-labelledby="selected-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="selected-heading" className="section-title">
                Selected Jobs
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {selectedJobs.length === 0
                  ? 'No jobs selected yet'
                  : `${selectedJobs.length} job${selectedJobs.length === 1 ? '' : 's'} selected`}
              </p>
            </div>
            {selectedJobs.length > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClearSelection}
              >
                Clear Selection
              </button>
            )}
          </div>

          {selectedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <svg
                className="mb-3 h-10 w-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-sm font-medium text-slate-600">No jobs selected</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Connect your Google Sheet or upload Excel, then search and select jobs above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onEditChange={(field, value) => updateJobField(job.id, field, value)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="card" aria-labelledby="job-date-heading">
          <h2 id="job-date-heading" className="section-title mb-4">
            Job Date
          </h2>
          <label htmlFor="job-date" className="field-label">
            Manufacturing date
          </label>
          <input
            id="job-date"
            type="date"
            className="input-base max-w-xs"
            value={jobDate}
            onChange={(e) => setJobDate(e.target.value)}
          />
        </section>

        <GenerateButton
          selectedJobs={selectedJobs}
          jobDate={parsedJobDate}
          disabled={loading}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Bhagwati Packers · Google Sheets connected
      </footer>
    </div>
  );
}
