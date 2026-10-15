// Hard caps per column. A column without an entry has no limit (Backlog, Done
// and custom columns). Always counted over all tasks, not the filtered board
// view, otherwise a search or priority filter would let cards past the limit.
export const COLUMN_LIMITS = {
  inprogress: 5,
  review: 3,
};

export const columnLimit = (status) => COLUMN_LIMITS[status] ?? null;

export const countInColumn = (tasks, status) =>
  (tasks || []).filter((t) => t.status === status).length;

// How many more cards fit. Infinity for columns without a limit.
export const roomInColumn = (tasks, status) => {
  const limit = columnLimit(status);
  if (limit === null) return Infinity;
  return Math.max(0, limit - countInColumn(tasks, status));
};

export const isColumnFull = (tasks, status) => roomInColumn(tasks, status) === 0;
