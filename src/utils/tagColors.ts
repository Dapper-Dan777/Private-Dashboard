const palette = [
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
];

const hash = (value: string) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

export const getTagColor = (tag: string) =>
  palette[hash(tag) % palette.length];
