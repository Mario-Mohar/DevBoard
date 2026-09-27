// "Last visit" has to mean the previous session, not the previous render.
//
// Keeping a single stamp and rewriting it on mount looks right until the first
// reload: the value read back is then the one written seconds earlier, and the
// board reports "0m ago" from that point on. So two stamps are kept. `seen` is
// pushed forward while you are on the board, and `visit` only moves once `seen`
// has gone stale, which is what makes it the start of the session before this
// one.
const SEEN_KEY = "last_seen";
const VISIT_KEY = "last_visit";

// How long the board has to go unseen before coming back counts as a new
// visit. Short enough that a break reads as one, long enough that a reload or
// a trip to another tab does not.
export const VISIT_GAP_MS = 30 * 60 * 1000;

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    // Private mode and blocked site data both throw here. Without a stamp
    // there is nothing to show, which is the correct outcome, not an error.
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Nothing to do: the next load simply has no stamp to read.
  }
};

// Returns the previous visit as an ISO string, or null on the very first one.
// Called once per mount; it also moves the stamps forward.
export const openVisit = (now = Date.now()) => {
  const seen = read(SEEN_KEY);
  const seenAt = seen ? Date.parse(seen) : NaN;
  const stale = !Number.isFinite(seenAt) || now - seenAt > VISIT_GAP_MS;

  if (stale && Number.isFinite(seenAt)) {
    write(VISIT_KEY, seen);
  }

  write(SEEN_KEY, new Date(now).toISOString());
  return read(VISIT_KEY);
};

// Keeps `seen` fresh so that leaving the board and coming back later is what
// moves the visit stamp, not a reload.
export const touchVisit = (now = Date.now()) => {
  write(SEEN_KEY, new Date(now).toISOString());
};

export const timeAgo = (date) => {
  const at = typeof date === "number" ? date : Date.parse(date);
  if (!Number.isFinite(at)) return "";

  const mins = Math.floor((Date.now() - at) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
};
