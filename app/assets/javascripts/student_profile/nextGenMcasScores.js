export function shortLabelFromScore(score) {
  if (score >= 400 && score < 450) return 'NM';
  if (score >= 450 && score < 500) return 'P';
  if (score >= 500 && score < 550) return 'M';
  if (score >= 550 && score < 600) return 'E';
  return 'na';
}