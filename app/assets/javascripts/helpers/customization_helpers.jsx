function shouldDisplay(element, schoolContext) {
  switch(element) {
  case 'house':
    if (schoolContext && schoolContext.local_id) {
      return "SHS" === schoolContext.local_id;
    }
    return false;
  case 'counselor': 
    if (schoolContext && schoolContext.school_type) {
      return "HS" === schoolContext.school_type;
    }
    return false;
  }
  return false;
}
  
export { shouldDisplay }; 