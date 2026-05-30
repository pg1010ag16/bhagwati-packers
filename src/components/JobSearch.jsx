import { useMemo, useState } from 'react';
import Select from 'react-select';
import { filterJobsBySearch, jobsToSelectOptions } from '../utils/jobHelpers';

const selectStyles = {
  menu: (base) => ({ ...base, zIndex: 50 }),
};

export default function JobSearch({
  jobs,
  selectedJobs,
  onSelectionChange,
  disabled,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = useMemo(
    () => filterJobsBySearch(jobs, searchQuery),
    [jobs, searchQuery],
  );

  const options = useMemo(() => jobsToSelectOptions(filteredJobs), [filteredJobs]);

  const value = useMemo(
    () => jobsToSelectOptions(selectedJobs),
    [selectedJobs],
  );

  if (!jobs.length) {
    return (
      <section className="card opacity-60" aria-labelledby="search-heading">
        <h2 id="search-heading" className="section-title mb-2">
          Search Jobs
        </h2>
        <p className="text-sm text-slate-500">
          Upload an Excel file first to search and select jobs.
        </p>
      </section>
    );
  }

  return (
    <section className="card" aria-labelledby="search-heading">
      <h2 id="search-heading" className="section-title mb-4">
        Search Jobs
      </h2>

      <label htmlFor="job-search-input" className="field-label">
        Search by Customer Name, Box Name, or Box ID
      </label>
      <input
        id="job-search-input"
        type="search"
        className="input-base mb-4"
        placeholder="Type to filter jobs…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={disabled}
      />

      <label htmlFor="job-select" className="field-label">
        Select jobs (multi-select)
      </label>
      <Select
        inputId="job-select"
        instanceId="job-select"
        classNamePrefix="job-select"
        isMulti
        isSearchable
        isDisabled={disabled}
        options={options}
        value={value}
        onChange={(selected) => {
          const list = selected ? selected.map((opt) => opt.job) : [];
          onSelectionChange(list);
        }}
        placeholder="Search and select jobs…"
        noOptionsMessage={() =>
          searchQuery ? 'No jobs match your search' : 'No jobs available'
        }
        styles={selectStyles}
        closeMenuOnSelect={false}
      />
    </section>
  );
}
