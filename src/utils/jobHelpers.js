export function jobLabel(job) {
  const parts = [job.customerName, job.boxName, job.boxId].filter(Boolean);
  return parts.join(' · ') || 'Unnamed job';
}

export function jobSearchText(job) {
  return [job.customerName, job.boxName, job.boxId]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function jobsToSelectOptions(jobs) {
  return jobs.map((job) => ({
    value: job.id,
    label: jobLabel(job),
    job,
  }));
}

export function filterJobsBySearch(jobs, query) {
  const q = query.trim().toLowerCase();
  if (!q) return jobs;
  return jobs.filter((job) => jobSearchText(job).includes(q));
}
