// "5m ago", "3h ago", "2d ago". Takes a timestamp in ms or anything Date.parse
// reads; an unreadable value gives an empty string instead of "NaNd ago".
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
