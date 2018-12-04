// For immutable merging into an object path
export function mergeAtPath(object, path, patch) {
  if (path.length === 0) return {...object, ...patch};
  const [head, ...tail] = path;
  return {
    ...object,
    [head]: mergeAtPath(object[head], tail, patch)
  };
}
