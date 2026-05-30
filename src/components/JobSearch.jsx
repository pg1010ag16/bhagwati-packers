import { useCallback, useMemo, useState } from 'react';
import Select from 'react-select';
import { jobMatchesQuery, jobsToSelectOptions } from '../utils/jobHelpers';

const selectStyles = {
  menu: (base) => ({ ...base, zIndex: 50 }),
  menuPortal: (base) => ({ ...base, zIndex: 50 }),
};

export default function JobSearch({
  jobs,
  selectedJobs,
  onSelectionChange,
  disabled,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const options = useMemo(() => jobsToSelectOptions(jobs), [jobs]);

  const value = useMemo(
    () => jobsToSelectOptions(selectedJobs),
    [selectedJobs],
  );

  const filterOption = useCallback((option, inputValue) => {
    const job = option.data?.job;
    if (job) {
      return jobMatchesQuery(job, inputValue);
    }
    const label = (option.label ?? '').toLowerCase();
    const q = inputValue.trim().toLowerCase();
    return !q || label.includes(q);
  }, []);

  const handleInputChange = (inputValue, { action }) => {
    if (action === 'input-change') {
      setSearchQuery(inputValue);
    }
    if (action === 'menu-close' && !inputValue) {
      setSearchQuery('');
    }
  };

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
        Search by customer, box name, dimensions, layers, paper BF, GSM, etc.
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
        inputValue={searchQuery}
        onInputChange={handleInputChange}
        filterOption={filterOption}
        onChange={(selected) => {
          const list = selected ? selected.map((opt) => opt.job) : [];
          onSelectionChange(list);
        }}
        placeholder="Search and select jobs…"
        noOptionsMessage={({ inputValue }) =>
          inputValue?.trim()
            ? `No jobs match "${inputValue}"`
            : 'Type above or here to search'
        }
        styles={selectStyles}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        blurInputOnSelect={false}
      />
    </section>
  );
}
