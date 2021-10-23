import {
  firstMatchWithGrades,
  ENGLISH_OR_CORE_ELL,
  SOCIAL_STUDIES,
  MATH,
  SCIENCE
} from './Courses';


function testAssignments() {
  return [
    { grade_letter: 'B-', section: { course_description: 'ESL' } },
    { grade_letter: 'B+', section: { course_description: 'ESL - Semester SS' } },
    { grade_letter: 'A-', section: { course_description: 'SAFE - Pre-Algebra' } },
    { grade_letter: 'B', section: { course_description: 'CHEMISTRY HONORS' } }
  ];
}
it('#firstMatchWithGrades', () => {
  expect(firstMatchWithGrades(testAssignments(), ENGLISH_OR_CORE_ELL).grade_letter).toEqual('B-');
  expect(firstMatchWithGrades(testAssignments(), SOCIAL_STUDIES).grade_letter).toEqual('B+');
  expect(firstMatchWithGrades(testAssignments(), MATH).grade_letter).toEqual('A-');
  expect(firstMatchWithGrades(testAssignments(), SCIENCE).grade_letter).toEqual('B');  
});
