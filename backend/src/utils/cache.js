// Tiny in-memory TTL cache for hot, anonymous, read-mostly queries (recipe lists, facets).
// Cleared whenever a recipe is created, edited or deleted so users never see stale lists for long.
const store = new Map();
const MAX_ENTRIES = 500;

export const cached = async (key, ttlMs, load) => {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await load();
  if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value);
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
};

export const clearCache = () => store.clear();
