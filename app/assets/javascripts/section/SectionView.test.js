import React from 'react';
import ReactDOM from 'react-dom';
import SectionView from './SectionView';
import PerDistrictContainer from '../components/PerDistrictContainer';


function testProps(props = {}) {
  return {
    students: [
      { id: 1, first_name: 'Minnie', last_name: 'Mouse', program_assigned: 'Regular Ed', disability:'', plan_504: '', limited_english_proficiency: 'FLEP', home_language: 'Spanish', free_reduced_lunch: 'Free Lunch', most_recent_school_year_absences_count: 3, most_recent_school_year_tardies_count: 5, most_recent_school_year_discipline_incidents_count: 0, star_series_math_percentile: null, star_series_reading_percentile: null, event_notes_without_restricted: [], has_photo: true },
      { id: 2, first_name: 'Donald', last_name: 'Duck', program_assigned: 'Special Ed', disability:'Motor', plan_504: '504 Plan', limited_english_proficiency: 'ELL', home_language: 'English', free_reduced_lunch: 'Reduced Lunch', most_recent_school_year_absences_count: 1, most_recent_school_year_tardies_count: 0, most_recent_school_year_discipline_incidents_count: 0, star_series_math_percentile: null, star_series_reading_percentile: null, event_notes_without_restricted: [], has_photo: false},
    ],
    educators: [
      { }
    ],
    sections: [
      { id: 1, section_number: 'Art-1', course_description: 'DRAWING WITH CHARCOAL', term_local_id: '9'},
      { id: 2, section_number: 'Art-2', course_description: 'DRAWING WITH CHARCOAL', term_local_id: 'FY'},
      { id: 3, section_number: 'Art-3', course_description: 'DRAWING WITH CHARCOAL', term_local_id: 'Q1'}
    ],
    section: { id: 1, section_number: 'Art-1', course_number: 'Art', course_description: 'Awesome Art Class', term_local_id: '9', schedule: '3(M-R)', room_number: '304' },
    currentEducator: { districtwide_access: false },
    ...props
  };
}

function testRender(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  const el = document.createElement('div');
  ReactDOM.render(
    <PerDistrictContainer districtKey={districtKey}>
      <SectionView {...props} />
    </PerDistrictContainer>
    , el);
  return {el};
}



it('renders the correct section header', () => {
  const {el} = testRender(testProps());

  expect($(el).text()).toContain('Awesome Art Class (Art-1)');
  expect($(el).text()).toContain('Room 304');
  expect($(el).text()).toContain('Schedule 3(M-R)');
  expect($(el).text()).toContain('Term 9');
});

describe('table headers', () => {
  it('includes grades and note types for Somerville', () => {
    const {el} = testRender(testProps(), {districtKey: 'somerville'});
    const headers = $(el).find('.SectionView #roster-header th').toArray().map(el => $(el).text());
    expect(headers.length).toEqual(22);
    expect(headers).toEqual([
      'Name',
      '', // photo
      'Last SST',
      'Last NGE',
      'Last 10GE',
      'Last NEST',
      'Last Counselor',
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

  it('no grades and note types in New Bedford', () => {
    const {el} = testRender(testProps(), {districtKey: 'new_bedford'});
    const headers = $(el).find('.SectionView #roster-header th').toArray().map(el => $(el).text());
    expect(headers.length).toEqual(17);
    expect(headers.indexOf('Grade')).toEqual(-1);
    expect(headers).toEqual([
      'Name',
      '', // photo
      'Last BBST',
      'Program Assigned',
      'Disability',
      '504 Plan',
      'Fluency',
      'Home Language',
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
});

it('renders the correct roster data', () => {
  const {el} = testRender(testProps());

  const $rowEls = $(el).find('.SectionView #roster-data tr');
  expect($rowEls.length).toEqual(2);
  const firstRowCells = $($rowEls.get(0)).find('td').toArray().map(el => $(el).html());
  expect(firstRowCells[0]).toEqual('<a href="/students/2">Duck, Donald</a>');
});

it('renders photos and respects has_photo', () => {
  const {el} = testRender(testProps());
  expect($(el).find('.StudentPhotoCropped').length).toEqual(1);
});


it('renders the correct section select', () => {
  const {el} = testRender(testProps());
  expect($(el).find('.SectionNavigator').length).toEqual(1);
});