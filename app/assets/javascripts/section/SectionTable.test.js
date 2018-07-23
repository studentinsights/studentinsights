import React from 'react';
import ReactDOM from 'react-dom';
import SectionTable from './SectionTable';
import PerDistrictContainer from '../components/PerDistrictContainer';


function testProps(props = {}) {
  return {
    students: [
      { id: 1, first_name: 'Minnie', last_name: 'Mouse', program_assigned: 'Regular Ed', disability:'', plan_504: '', limited_english_proficiency: 'FLEP', home_language: 'Spanish', free_reduced_lunch: 'Free Lunch', most_recent_school_year_absences_count: 3, most_recent_school_year_tardies_count: 5, most_recent_school_year_discipline_incidents_count: 0, event_notes_without_restricted: []},
      { id: 2, first_name: 'Donald', last_name: 'Duck', program_assigned: 'Special Ed', disability:'Motor', plan_504: '504 Plan', limited_english_proficiency: 'ELL', home_language: 'English', free_reduced_lunch: 'Reduced Lunch', most_recent_school_year_absences_count: 1, most_recent_school_year_tardies_count: 0, most_recent_school_year_discipline_incidents_count: 0, event_notes_without_restricted: []},
    ],
    educators: [
      { }
    ],
    sections: [
      { id: 1, section_number: 'Art-1'},
      { id: 2, section_number: 'Art-2'},
      { id: 3, section_number: 'Art-3'}
    ],
    section: { id: 1, section_number: 'Art-1', course_number: 'Art', course_description: 'Awesome Art Class', term_local_id: '9', schedule: '3(M-R)', room_number: '304' },
    currentEducator: { districtwide_access: false },
    ...props
  };
}

function testRender(props) {
  const districtKey = 'somerville';
  const el = document.createElement('div');
  ReactDOM.render(
    <PerDistrictContainer districtKey={districtKey}>
      <SectionTable {...props} />
    </PerDistrictContainer>
  , el);
  return {el};
}


it('renders the correct section select', () => {
  const {el} = testRender(testProps());

  const sectionSelect = $(el).find('#section-select option');

  expect(sectionSelect[0].innerHTML).toEqual('Art-1');
  expect(sectionSelect[0].selected).toEqual(true);
  expect(sectionSelect[0].value).toEqual('1');

  expect(sectionSelect[1].innerHTML).toEqual('Art-2');
  expect(sectionSelect[1].selected).toEqual(false);
  expect(sectionSelect[1].value).toEqual('2');
});

it('renders the correct section header', () => {
  const {el} = testRender(testProps());

  const headerInfo = $(el).find('#section-header-info');
  const sectionName = headerInfo.find('h1').text();
  const courseInfo = headerInfo.find('#course-info').text();
  const sectionDetail = headerInfo.find('#section-detail').text();

  expect(sectionName).toEqual('Art-1');
  expect(courseInfo).toEqual('Awesome Art Class (Art)');
  expect(sectionDetail).toEqual('Room 304 • Schedule: 3(M-R) • Term: 9');
});

it('renders the correct roster headers', () => {
  const {el} = testRender(testProps());

  const headers = $(el).find('#roster-header th').toArray().map(el => $(el).text());

  expect(headers.length).toEqual(19);
  expect(headers).toEqual([
    'Name',
    'Last SST',
    'Last NGE',
    'Last 10GE',
    'Program Assigned',
    'Disability',
    '504 Plan',
    'Fluency',
    'Home Language',
    'Grade',
    'Absences',
    'Tardies',
    'Discipline Incidents',
    'Percentile',
    'Percentile',
    'Performance',
    'Score',
    'Performance',
    'Score'
  ]);
});

it('renders the correct roster data', () => {
  const {el} = testRender(testProps());
  
  const $rowEls = $(el).find('#roster-data tr');
  expect($rowEls.length).toEqual(2);
  const firstRowCells = $($rowEls.get(0)).find('td').toArray().map(el => $(el).html());
  expect(firstRowCells[0]).toEqual('<a href="/students/2">Duck, Donald</a>');
});
