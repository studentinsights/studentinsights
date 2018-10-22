import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {toMoment, toMomentFromTimestamp} from '../helpers/toMoment';
import {withDefaultNowContext} from '../testing/NowContainer';
import LightProfilePage, {latestStar, countEventsSince} from './LightProfilePage';
import {
  testPropsForPlutoPoppins,
  testPropsForOlafWhite,
  testPropsForAladdinMouse
} from './profileTestProps.fixture';


function testingTabTextLines(el) {
  const leafEls = $(el).find('.LightProfileTab:eq(2) *:not(:has(*))').toArray(); // magic selector from https://stackoverflow.com/questions/4602431/what-is-the-most-efficient-way-to-get-leaf-nodes-with-jquery#4602476
  return leafEls.map(el => $(el).text());
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(<LightProfilePage {...props} />, el);
  return el;
}

it('renders without crashing', () => {
  testRender(testPropsForPlutoPoppins());
});

describe('snapshots', () => {
  function expectSnapshot(props) {
    const tree = renderer
      .create(withDefaultNowContext(<LightProfilePage {...props} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  }

  it('works for olaf notes', () => expectSnapshot(testPropsForOlafWhite({selectedColumnKey: 'notes'})));
  it('works for olaf reading', () => expectSnapshot(testPropsForOlafWhite({selectedColumnKey: 'reading'})));
  it('works for olaf math', () => expectSnapshot(testPropsForOlafWhite({selectedColumnKey: 'math'})));

  it('works for pluto notes', () => expectSnapshot(testPropsForPlutoPoppins({selectedColumnKey: 'notes'})));
  it('works for pluto attendance', () => expectSnapshot(testPropsForPlutoPoppins({selectedColumnKey: 'attendance'})));
  it('works for pluto behavior', () => expectSnapshot(testPropsForPlutoPoppins({selectedColumnKey: 'behavior'})));

  it('works for aladdin notes', () => expectSnapshot(testPropsForAladdinMouse({selectedColumnKey: 'notes'})));
  it('works for aladdin grades', () => expectSnapshot(testPropsForAladdinMouse({selectedColumnKey: 'grades'})));
  it('works for aladdin testing', () => expectSnapshot(testPropsForAladdinMouse({selectedColumnKey: 'testing'})));
});


describe('HS testing tab', () => {
  it('works when missing', () => {
    const props = testPropsForAladdinMouse();
    const el = testRender(props);
    expect(testingTabTextLines(el)).toEqual([
      'Testing',
      '-',
      'ELA and Math MCAS',
      'not yet taken'
    ]);
  });

  it('takes next gen when there are both', () => {
    const aladdinProps = testPropsForAladdinMouse();
    const props = {
      ...aladdinProps,
      chartData: {
        ...aladdinProps.chartData,
        "next_gen_mcas_mathematics_scaled": [[2014,5,15,537]],
        "next_gen_mcas_ela_scaled": [[2015,5,15,536]],
        "mcas_series_math_scaled": [[2015,5,15,225]],
        "mcas_series_ela_scaled": [[2015,5,15,225]]
      }
    };
    const el = testRender(props);
    expect(testingTabTextLines(el)).toEqual([
      'Testing',
      'M',
      'ELA and Math MCAS',
      '9 months ago / 2 years ago'
    ]);
  });

  it('falls back to old MCAS when no next gen', () => {
    const aladdinProps = testPropsForAladdinMouse();
    const props = {
      ...aladdinProps,
      chartData: {
        ...aladdinProps.chartData,
        "next_gen_mcas_mathematics_scaled": [],
        "next_gen_mcas_ela_scaled": [],
        
        "mcas_series_math_scaled": [[2015,5,15,225]],
        "mcas_series_ela_scaled": [[2015,5,15,225]]
      }
    };
    const el = testRender(props);
    expect(testingTabTextLines(el)).toEqual([
      'Testing',
      'NI',
      'ELA and Math MCAS',
      '9 months ago'
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
    const defaultProps = testPropsForOlafWhite();
    const el = testRender({
      ...defaultProps,
      districtKey: 'somerville',
      student: {
        ...defaultProps.student,
        enrollment_status: 'Withdrawn'
      }
    });
    expect($(el).find('.LightProfilePage-inactive-overlay').length).toEqual(1);
    expect($(el).text()).toContain('no longer actively enrolled');
  });

  it('is shown for students missing from export in New Bedford', () => {
    const defaultProps = testPropsForOlafWhite();
    const el = testRender({
      ...defaultProps,
      districtKey: 'new_bedford',
      student: {
        ...defaultProps.student,
        missing_from_last_export: true
      }
    });
    expect($(el).find('.LightProfilePage-inactive-overlay').length).toEqual(1);
    expect($(el).text()).toContain('no longer actively enrolled');
  });

  it('is shown for students missing from export in Bedford', () => {
    const defaultProps = testPropsForOlafWhite();
    const el = testRender({
      ...defaultProps,
      districtKey: 'bedford',
      student: {
        ...defaultProps.student,
        missing_from_last_export: true
      }
    });
    expect($(el).find('.LightProfilePage-inactive-overlay').length).toEqual(1);
    expect($(el).text()).toContain('no longer actively enrolled');
  });
});
