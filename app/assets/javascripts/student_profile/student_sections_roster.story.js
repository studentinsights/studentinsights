import React from 'react';
import { storiesOf } from '@storybook/react';
import StudentSectionsRoster from './student_sections_roster.jsx';

const sections = [
  { id: 321, section_number: "ART-302A", term_local_id: "FY", schedule: "2(M,R)", room_number: "201", course: 'art_course' },
  { id: 325, section_number: "ART-302B", term_local_id: "FY", schedule: "4(M,R)", room_number: "234", course: 'art_course' },
  { id: 364, section_number: "SCI-201A", term_local_id: "S1", schedule: "3(M,W,F)", room_number: "306W", course: 'science_course' },
  { id: 332, section_number: "SCI-201B", term_local_id: "S1", schedule: "4(M,W,F)", room_number: "306W", course: 'science_cours' }
];

storiesOf('student/StudentSectionsRoster', module) // eslint-disable-line no-undef
  .add('default', () => <StudentSectionsRoster sections={sections} />);
