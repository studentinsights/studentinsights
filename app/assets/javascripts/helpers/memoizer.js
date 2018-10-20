// as naive as possible
export default function memoizer() {
  const cacheStorage = {};

  // eg memoize(['methodName', this.state, arguments], () => { ... });
  return function memoize(keys, fn) {
    const cacheKey = JSON.stringify(keys);
    const cached = cacheStorage[cacheKey];
    if (cached !== undefined) return cached;

    const value = fn();
    cacheStorage[cacheKey] = value;
    return value;
  };
}
