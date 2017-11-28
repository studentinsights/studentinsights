function shouldDisplay(element, school) {
  switch(element) {
  case 'house':
    if (school && school.local_id) {
      return "SHS" === school.local_id;
    }
    return false;
  case 'counselor': 
    if (school && school.school_type) {
      return "HS" === school.school_type;
    }
    return false;
  default:
    return false;
  }
}
  
export { shouldDisplay }; 