// as naive as possible
export function createCache() {
  const cacheStorage = {};

  // eg cache('expensiveThing', [this.state, arguments], () => { ... });
  return function cache(keys, fn) {
    const cacheKey = JSON.stringify(keys);
    const cached = cacheStorage[cacheKey];
    if (cached !== undefined) return cached;

    const value = fn();
    cacheStorage[cacheKey] = value;
    return value;
  };
}
