// Bucket STAR percentiles into high/medium/low
export const starBucketThresholds = [0, 0.30, 0.70, 1];
export function starBucket(percentile) {
  if (percentile == null) return null;

  const lowThreshold = 100 * starBucketThresholds[1];
  const highThreshold = 100 * starBucketThresholds[2];
  if (percentile < lowThreshold) return 'low';
  if (percentile > highThreshold) return 'high';
  return 'medium';
}

// Returns {null|true|false} since sometimes there's not enough information
// to know.
export function shouldHighlight(percentile) {
  if (percentile === null || percentile === undefined) return null;
  if (starBucket(percentile) === 'low') return true;
  return false;
}