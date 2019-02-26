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
      'M',
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

describe('reading and math can show MCAS if STAR not enabled', () => {
  it('for Bedford, shows MCAS in place of STAR', () => {
    const props = mergeAtPath(testPropsForOlafWhite(), ['profileJson', 'chartData'], {
      "next_gen_mcas_mathematics_scaled": [[2016,5,15,537]],
      "next_gen_mcas_ela_scaled": [[2017,5,15,536]],
      "mcas_series_math_scaled": [],
      "mcas_series_ela_scaled": []
    });
    const el = testRender(props, {districtKey: 'bedford'});
    expect(testingTabTextLines(1, el)).toEqual([
      'Reading',
      'M',
      'MCAS ELA',
      '10 months ago'
    ]);
    expect(testingTabTextLines(2, el)).toEqual([
      'Math',
      'M',
      'MCAS Math',
      '2 years ago'
    ]);
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
