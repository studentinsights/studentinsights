// Turns SIS format (Watson, Joe) -> Joe Watson and falls back to email if there isn't a full_name
export function formatEducatorName(educator) {
  if (educator.full_name === null) return educator.email.split('@')[0] + '@';
  const parts = educator.full_name.split(', ');
  return parts[1] + ' ' + parts[0];
}