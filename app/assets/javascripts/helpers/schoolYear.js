// July 1st starts the new school year
export function startOfSchoolForDate(date) {
  const year = date.getMonth() < 6 ? date.getFullYear() - 1: date.getFullYear();
  return startOfSchoolForYear(year);
}

export function startOfSchoolForYear(year) {
  return new Date(year, 6, 1); 
}

export function endOfSchoolForYear(year) {
  return new Date(year + 1, 5, 30);  
}