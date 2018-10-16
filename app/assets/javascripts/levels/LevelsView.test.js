import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import LevelsView from './LevelsView';
import levelsShowJson from './levelsShowJson.fixture';

function testProps(props = {}) {
  return {
    systemsAndSupportsUrl: 'https://example.com/foo',
    sourceCodeUrl: 'https://example.com/source',
    studentsWithLevels: levelsShowJson.students_with_levels,
    ...props
  };
}

function testEl(props) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <LevelsView {...props} />
    </PerDistrictContainer>
  );
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);

  expect($(el).html()).toContain('Search 74 students...');
  expect($(el).find('.Select').length).toEqual(5);
  expect($(el).text()).toContain('Grade...');
  expect($(el).text()).toContain('House...');
  expect($(el).text()).toContain('Level...');
  expect($(el).text()).toContain('Trigger...');
  expect($(el).find('.StudentLevelsTable').length).toEqual(1);
});

// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117

it('renders a download CSV button in the modal that works', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);

  // check the modal in body, outside the container el
  expect($(document.body).html()).not.toContain('Download CSV');
  ReactTestUtils.Simulate.click($(el).find('svg').get(0));
  expect($(document.body).html()).toContain('Download CSV');

  // essentially, snapshot the contents of the download
  const csvDownloadHref = 'data:attachment/csv,Student%2CLevel%2CAttendance_Rate%2CDiscipline_Incidents%2CEN_or_ELL%2CSocial_Studies%2CMath%2CScience%2CLast_xGE_or_NEST%2CLast_SST%2COther_notes%2CStudy_skills%2CAcademic_Support%2CRedirect%2CCredit_Recovery%2CProgram_or_SPED%0AAladdin%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AChip%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0ADaisy%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AElsa%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AMinnie%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2C%0AMinnie%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0APocahontas%20Disney%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0ASnow%20Disney%2C0%2C97%25%2C2%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPrivate%20Separate%0AAladdin%20Duck%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0ADaisy%20Duck%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AMowgli%20Duck%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AAladdin%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2C%0AAladdin%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AChip%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2C%0ADonald%20Kenobi%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AElsa%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AMari%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AMickey%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AMinnie%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0APluto%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0APluto%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2CA%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0ASnow%20Kenobi%2C0%2C100%25%2C1%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AAladdin%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AChip%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0ADonald%20Mouse%2C0%2C97%25%2C0%2C%2C%2C%2CD%2C%2C%2C%2C%2C%2C%2C%2C%0APluto%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0ARapunzel%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0ARapunzel%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0AWinnie%20Mouse%2C0%2C97%25%2C0%2C%2C%2C%2CB%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AWinnie%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0ADaisy%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0ADonald%20Pan%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AMinnie%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AMowgli%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AMowgli%20Pan%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AOlaf%20Pan%2C0%2C100%25%2C1%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AOlaf%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0ARapunzel%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0ARapunzel%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2CA%2C%2C%2C%2C%2C%2C%2C%2CPrivate%20Separate%0ARapunzel%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0ARapunzel%20Pan%2C0%2C100%25%2C1%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0ASnow%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AAladdin%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AChip%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AElsa%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AMickey%20Poppins%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AMickey%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AMowgli%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0APocahontas%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0ARapunzel%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPrivate%20Separate%0AWinnie%20Poppins%2C0%2C97%25%2C0%2C%2C%2C%2CB%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0AKylo%20Ren%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AAladdin%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AAladdin%20Skywalker%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AChip%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0ADaisy%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0ADonald%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0ADonald%20Skywalker%2C0%2C100%25%2C1%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0AElsa%20Skywalker%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0AMickey%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0APocahontas%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0APocahontas%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0ASnow%20Skywalker%2C0%2C97%25%2C0%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0AAmir%20Solo%2C0%2C100%25%2C0%2C%2C%2C%2CB%2C%2C%2C%2C%2C%2C%2C%2C%0AChip%20White%2C0%2C97%25%2C0%2C%2C%2C%2CA%2C%2C%2C%2C%2C%2C%2C%2C%0AElsa%20White%2C0%2C100%25%2C0%2C%2C%2C%2CD%2C%2C%2C%2C%2C%2C%2C%2CPrivate%20Separate%0AMowgli%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0AMowgli%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0AOlaf%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0APocahontas%20White%2C0%2C100%25%2C1%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0APocahontas%20White%2C0%2C100%25%2C0%2C%2C%2C%2CA%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0ASnow%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0ASnow%20White%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2C%0AWinnie%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish';
  expect($(document.body).find('.DownloadCsvLink').attr('href')).toEqual(csvDownloadHref);
});
