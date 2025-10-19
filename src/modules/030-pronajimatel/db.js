import * as subjects from '/src/db/subjects.js';

// Modulová proxy pro 030 (nastaví default role pokud není dodána)
export const listSubjects = (opts = {}) => subjects.listSubjects({ ...opts, role: opts.role || 'pronajimatel' });
export const getSubject = subjects.getSubject;
export const upsertSubject = (payload = {}, currentUser = null) => subjects.upsertSubject({ ...payload, role: payload.role || 'pronajimatel' }, currentUser);
export const assignSubjectToProfile = subjects.assignSubjectToProfile;
export const unassignSubjectFromProfile = subjects.unassignSubjectFromProfile;
export const getSubjectHistory = subjects.getSubjectHistory;
export const archiveSubject = subjects.archiveSubject;
export const unarchiveSubject = subjects.unarchiveSubject;
export default { listSubjects, getSubject, upsertSubject, assignSubjectToProfile, unassignSubjectFromProfile, getSubjectHistory, archiveSubject, unarchiveSubject };
