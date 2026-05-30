const EMPTY_EDITS = { editableRemarks: '', noOfCuts: '' };

export function getJobEdits(jobEditsMap, jobId) {
  return { ...EMPTY_EDITS, ...jobEditsMap[jobId] };
}

export function applyEditsToJob(job, jobEditsMap) {
  const edits = getJobEdits(jobEditsMap, job.id);
  return { ...job, ...edits };
}

export function applyEditsToJobs(jobs, jobEditsMap) {
  return jobs.map((job) => applyEditsToJob(job, jobEditsMap));
}
