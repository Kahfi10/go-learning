export const LEARNING_STORAGE_KEYS = {
  progress: "golearn_progress",
  resume: "golearn_resume",
  bookmarks: "golearn_bookmarks",
  lang: "golearn_lang",
};

export function codeStorageKey(topic: string, lesson: string) {
  return `golearn_code_${topic}_${lesson}`;
}

export function legacyCodeStorageKey(topic: string, lesson: string) {
  return `${topic}_${lesson}_code`;
}

export function clearLearningClientState() {
  if (typeof window === "undefined") return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key === LEARNING_STORAGE_KEYS.lang) continue;
    if (key.startsWith("golearn_")) keysToRemove.push(key);
    if (/_code$/.test(key)) keysToRemove.push(key);
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
