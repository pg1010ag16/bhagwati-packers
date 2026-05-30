export function jobLabel(job) {
  const parts = [job.customerName, job.boxName, job.boxId].filter(Boolean);
  return parts.join(' · ') || 'Unnamed job';
}

/** All values used for search matching (normalized to lowercase). */
export function jobSearchText(job) {
  return [
    job.customerName,
    job.boxName,
    job.boxId,
    job.layers,
    job.dimensions,
    job.reelSize,
    job.cutSize,
    job.paperBf,
    job.paperGsmFace,
    job.paperGsmFlute1,
    job.paperGsmKraft1,
    job.paperGsmFlute2,
    job.paperGsmKraft2,
    job.colorJob,
    job.remarks,
    job.proceedToManufacture,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function jobMatchesQuery(job, query) {
  const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return true;

  const haystack = jobSearchText(job);
  if (haystack.includes(q)) return true;

  // Match each word (e.g. "rakesh raw" finds "Rakesh ji · Raw Sheets")
  const terms = q.split(' ').filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

export function jobsToSelectOptions(jobs) {
  return jobs.map((job) => ({
    value: job.id,
    label: jobLabel(job),
    job,
  }));
}

export function filterJobsBySearch(jobs, query) {
  return jobs.filter((job) => jobMatchesQuery(job, query));
}
