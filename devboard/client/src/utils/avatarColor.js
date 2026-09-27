// One colour per person, shared by the card avatar and the column header so
// the same name is never two different colours on the same board.
const AVATAR_COLORS = [
  "bg-[var(--accent)]",
  "bg-blue-600",
  "bg-green-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-teal-600",
];

// Sum every character so that names sharing a first letter still differ.
export const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};
