import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {mergeAtPath} from '../helpers/mergeAtPath';
import {toMoment, toMomentFromTimestamp} from '../helpers/toMoment';
import {withDefaultNowContext} from '../testing/NowContainer';
import LightProfilePage, {latestStar, countEventsSince} from './LightProfilePage';
import {
  testPropsForPlutoPoppins,
  testPropsForOlafWhite,
  testPropsForAladdinMouse
} from './LightProfilePage.fixture';


jest.mock('./ReaderProfileDeprecated', () => 'mocked-reader-profile-deprecated');
jest.mock('../reader_profile/ReaderProfileJunePage', () => 'mocked-reader-profile-june-page');
jest.mock('../reader_profile_january/ReaderProfileJanuaryPage', () => 'mocked-reader-profile-january-page');


function testingTabTextLines(tabIndex, el) {
  const leafEls = $(el).find('.LightProfileTab:eq(' + tabIndex+ ') *:not(:has(*))').toArray(); // magic selector from https://stackoverflow.com/questions/4602431/what-is-the-most-efficient-way-to-get-leaf-nodes-with-jquery#4602476
  return leafEls.map(el => $(el).text());
}

function testEl(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <LightProfilePage {...props} />
    </PerDistrictContainer>
  );
}
function testRender(props, context = {}) {
  const el = document.createElement('div');
  ReactDOM.render(testEl(props, context), el);
  return el;
}

function findReaderProfiles(el) {
  const elaDetailsEl = $(el).find('.ElaDetails');
  return {
    deprecated: $(elaDetailsEl).find('mocked-reader-profile-deprecated').length == 1,
    june: $(elaDetailsEl).find('mocked-reader-profile-june-page').length == 1,
    january: $(elaDetailsEl).find('mocked-reader-profile-january-page').length == 1
  };
}

it('renders without crashing', () => {
  testRender(testPropsForPlutoPoppins());
});

describe('snapshots', () => {
  function expectSnapshot(props, context = {}) {
    const tree = renderer
      .create(testEl(props, context))
      .toJSON();
    expect(tree).toMatchSnapshot();
  }

  it('works for olaf notes', () => expectSnapshot({...testPropsForOlafWhite(), selectedColumnKey: 'notes'}));
  it('works for olaf reading', () => expectSnapshot({...testPropsForOlafWhite(), selectedColumnKey: 'reading'}));
  it('works for olaf math', () => expectSnapshot({...testPropsForOlafWhite(), selectedColumnKey: 'math'}));

  it('works for pluto notes', () => expectSnapshot({...testPropsForPlutoPoppins(), selectedColumnKey: 'notes'}));
  it('works for pluto attendance', () => expectSnapshot({...testPropsForPlutoPoppins(), selectedColumnKey: 'attendance'}));
  it('works for pluto behavior', () => expectSnapshot({...testPropsForPlutoPoppins(), selectedColumnKey: 'behavior'}));

  it('works for aladdin notes', () => expectSnapshot({...testPropsForAladdinMouse(), selectedColumnKey: 'notes'}));
  it('works for aladdin grades', () => expectSnapshot({...testPropsForAladdinMouse(), selectedColumnKey: 'grades'}));
  it('works for aladdin testing', () => expectSnapshot({...testPropsForAladdinMouse(), selectedColumnKey: 'testing'}));
});


describe('HS testing tab', () => {
  it('works when missing', () => {
    const props = testPropsForAladdinMouse();
    const el = testRender(props);
    expect(testingTabTextLines(2, el)).toEqual([
      'Testing',
      '-',
      'ELA and Math MCAS',
      'not yet taken'
    ]);
  });

  it('takes next gen when there are both', () => {
    const props = mergeAtPath(testPropsForAladdinMouse(), ['profileJson', 'chartData'], {
      "next_gen_mcas_mathematics_scaled": [[2016,5,15,537]],
      "next_gen_mcas_ela_scaled": [[2017,5,15,536]],
      "mcas_series_math_scaled": [[2017,5,15,225]],
      "mcas_series_ela_scaled": [[2017,5,15,225]]
    });
    const el = testRender(props);
    expect(testingTabTextLines(2, el)).toEqual([
      'Testing',
      'E',
      'ELA and Math MCAS',
      '10 months / 2 years ago'
    ]);
  });

  it('falls back to old MCAS when no next gen', () => {
    const props = mergeAtPath(testPropsForAladdinMouse(), ['profileJson', 'chartData'], {
      "next_gen_mcas_mathematics_scaled": [],
      "next_gen_mcas_ela_scaled": [],
      "mcas_series_math_scaled": [[2017,5,15,225]],
      "mcas_series_ela_scaled": [[2017,5,15,225]]
    });
    const el = testRender(props);
    expect(testingTabTextLines(2, el)).toEqual([
      'Testing',
      'NI',
      'ELA and Math MCAS',
      '10 months ago'
    ]);
  });
});

describe('tabs', () => {
  it('for Bedford, shows MCAS in place of STAR', () => {
    const props = mergeAtPath(testPropsForOlafWhite(), ['profileJson', 'chartData'], {
      "next_gen_mcas_mathematics_scaled": [[2016,5,15,478]],
      "next_gen_mcas_ela_scaled": [[2017,5,15,536]],
      "mcas_series_math_scaled": [],
      "mcas_series_ela_scaled": []
    });
    const el = testRender(props, {districtKey: 'bedford'});
    expect(testingTabTextLines(1, el)).toEqual([
      'Reading',
      'E',
      'MCAS ELA',
      '10 months ago'
    ]);
    expect(testingTabTextLines(2, el)).toEqual([
      'Math',
      'PM',
      'MCAS Math',
      '2 years ago'
    ]);
  });

  it('for New Bedford, does not yet show sections and testing (still reading and math)', () => {
    const props = mergeAtPath(testPropsForOlafWhite(), ['profileJson', 'chartData'], {
      "next_gen_mcas_mathematics_scaled": [[2016,5,15,537]],
      "next_gen_mcas_ela_scaled": [[2017,5,15,536]],
      "mcas_series_math_scaled": [],
      "mcas_series_ela_scaled": []
    });
    const el = testRender(props, {districtKey: 'new_bedford'});
    expect(testingTabTextLines(1, el)).toEqual([
      'Reading',
      '10th',
      'STAR percentile',
      'a month ago'
    ]);
    expect(testingTabTextLines(2, el)).toEqual([
      'Math',
      '10th',
      'STAR percentile',
      'a month ago'
    ]);
  });
});

describe('sections link in header', () => {
  it('is shown for New Bedford', () => {
    const props = testPropsForAladdinMouse();
    const el = testRender(props, {districtKey: 'new_bedford'});
    expect($(el).find('.LightProfileHeader').text()).toContain('1 section');
  });

  it('is not present for Somerville', () => {
    const props = testPropsForAladdinMouse();
    const el = testRender(props, {districtKey: 'somerville'});
    expect($(el).find('.LightProfileHeader').text()).not.toContain('1 section');
  });

  it('is not present for Bedford', () => {
    const props = testPropsForAladdinMouse();
    const el = testRender(props, {districtKey: 'bedford'});
    expect($(el).find('.LightProfileHeader').text()).not.toContain('1 section');
  });
});


it('#latestStar works regardless of initial sort order', () => {
  const nowMoment = toMomentFromTimestamp('2018-08-13T11:03:06.123Z');
  const starSeriesReadingPercentile = [
    {"percentile_rank":98,"total_time":1134,"grade_equivalent":"6.90","date_taken":"2017-04-23T06:00:00.000Z"},
    {"percentile_rank":94,"total_time":1022,"grade_equivalent":"4.80","date_taken":"2017-01-07T02:00:00.000Z"}
  ];
  expect(latestStar(starSeriesReadingPercentile, nowMoment)).toEqual({
    nDaysText: 'a year ago',
    percentileText: '98th'
  });
  expect(latestStar(starSeriesReadingPercentile.reverse(), nowMoment)).toEqual({
    nDaysText: 'a year ago',
    percentileText: '98th'
  });
});

it('#countEventsSince works', () => {
  const absences = [
    {id: 217, occurred_at: "2018-07-23", student_id:42},
    {id: 219, occurred_at: "2018-05-12", student_id:42},
    {id: 216, occurred_at: "2018-05-11", student_id:42}
  ];
  expect(countEventsSince(toMoment('8/28/2018'), absences, 45)).toEqual(1);
});

describe('inactive overlay', () => {
  it('is shown for inactive students in Somerville', () => {
    const props = mergeAtPath(testPropsForOlafWhite(), ['profileJson', 'student'], {
      enrollment_status: 'Withdrawn'
    });
    const el = testRender(props, {districtKey: 'somerville'});
    expect($(el).find('.LightProfilePage-inactive-overlay').length).toEqual(1);
    expect($(el).text()).toContain('no longer actively enrolled');
  });

  it('is shown for students missing from export in New Bedford', () => {
    const props = mergeAtPath(testPropsForOlafWhite(), ['profileJson', 'student'], {
      missing_from_last_export: true
    });
    const el = testRender(props, {districtKey: 'new_bedford'});
    expect($(el).find('.LightProfilePage-inactive-overlay').length).toEqual(1);
    expect($(el).text()).toContain('no longer actively enrolled');
  });

  it('is shown for students missing from export in Bedford', () => {
    const props = mergeAtPath(testPropsForOlafWhite(), ['profileJson', 'student'], {
      missing_from_last_export: true
    });
    const el = testRender(props, {districtKey: 'bedford'});
    expect($(el).find('.LightProfilePage-inactive-overlay').length).toEqual(1);
    expect($(el).text()).toContain('no longer actively enrolled');
  });
});

describe('buttons', () => {
  it('shows print PDF and full case history', () => {
    const props = testPropsForAladdinMouse();
    const el = testRender(props);
    expect($(el).html()).toContain('Print PDF');
    expect($(el).html()).toContain('List all data points');
  });

  it('can show button for permissions', () => {
    const props = mergeAtPath(testPropsForAladdinMouse(), ['profileJson', 'currentEducator'], {
      labels: ['enable_viewing_educators_with_access_to_student']
    });
    const el = testRender(props);
    expect($(el).html()).toContain('Educators with access');
  });
});

describe('reader profile', () => {
  it('shows nothing for HS student, even with all labels and if reading tab were somehow selected', () => {
    let props = testPropsForAladdinMouse();
    props = mergeAtPath(props, ['profileJson', 'currentEducator'], {
      labels: [
        'profile_enable_minimal_reading_data',
        'enable_reader_profile_june',
        'enable_reader_profile_january'
      ]
    });
    props = {...props, selectedColumnKey: 'reading'};
    const el = testRender(props);
    expect(findReaderProfiles(el)).toEqual({
      deprecated: false,
      june: false,
      january: false
    });
  });

  it('shows January profile for 3rd grade student without labels', () => {
    let props = testPropsForAladdinMouse();
    props = mergeAtPath(props, ['profileJson', 'student'], {grade: '3'});
    props = {...props, selectedColumnKey: 'reading'};

    const el = testRender(props);
    expect(findReaderProfiles(el)).toEqual({
      deprecated: false,
      june: false,
      january: true
    });
  });
  
  it('shows January profile without label being set, PK grade student', () => {
    let props = testPropsForAladdinMouse();
    props = mergeAtPath(props, ['profileJson', 'student'], {grade: 'PK'});
    props = {...props, selectedColumnKey: 'reading'};

    const el = testRender(props);
    expect(findReaderProfiles(el)).toEqual({
      deprecated: false,
      june: false,
      january: true
    });
  });

  it('shows both profiles when June label is set, 5th grade student', () => {
    let props = testPropsForAladdinMouse();
    props = mergeAtPath(props, ['profileJson', 'currentEducator'], {
      labels: [
        'profile_enable_minimal_reading_data',
        'enable_reader_profile_june'
      ]
    });
    props = mergeAtPath(props, ['profileJson', 'student'], {grade: '5'});
    props = {...props, selectedColumnKey: 'reading'};

    const el = testRender(props);
    expect(findReaderProfiles(el)).toEqual({
      deprecated: true,
      june: true,
      january: true
    });
  });
});