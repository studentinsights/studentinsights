export function shortLabelFromNextGenMcasScore(score) {
  if (score >= 400 && score < 450) return 'NM'; // Not Meeting Expectations
  if (score >= 450 && score < 500) return 'PM'; // Partially Meeting
  if (score >= 500 && score < 550) return 'M'; // Meeting Expectations
  if (score >= 550 && score < 600) return 'E'; // Exceeding Expectations
  return null;
}
  
export function shortLabelFromOldMcasScore(score) {
  if (score >= 200 && score < 218) return 'W'; // Warning
  if (score >= 220 && score < 238) return 'NI'; // Needs Improvement
  if (score >= 240 && score < 258) return 'P'; // Proficient
  if (score >= 260 && score < 280) return 'E'; // Advanced
  return null;
}