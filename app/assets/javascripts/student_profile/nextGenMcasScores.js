export function shortLabelFromScore(score) {
  if (score >= 400 && score < 450) return 'NM'; // Not Meeting Expectations
  if (score >= 450 && score < 500) return 'PM'; // Partially Meeting
  if (score >= 500 && score < 550) return 'M'; // Meeting Expectations
  if (score >= 550 && score < 600) return 'E'; // Exceeding Expectations
  return null;
}