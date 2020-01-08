import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
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
  expect($(el).find('.Select').length).toEqual(6);
  expect($(el).text()).toContain('Grade...');
  expect($(el).text()).toContain('House...');
  expect($(el).text()).toContain('Counselor...');
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
  const csvDownloadHref = 'data:attachment/csv,Student_name_reversed%2CStudent%2CLevel%2CAttendance_Rate%2CDiscipline_Incidents%2CEN_or_ELL%2CSocial_Studies%2CMath%2CScience%2CLast_xGE_or_NEST%2CLast_SST%2CLast_Counselor%2CStudy_skills%2CAcademic_Support%2CRedirect%2CCredit_Recovery%2CProgram_or_SPED%0A%22Disney%2C%20Aladdin%22%2CAladdin%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Disney%2C%20Chip%22%2CChip%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0A%22Disney%2C%20Daisy%22%2CDaisy%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Disney%2C%20Elsa%22%2CElsa%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Disney%2C%20Minnie%22%2CMinnie%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Disney%2C%20Minnie%22%2CMinnie%20Disney%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0A%22Disney%2C%20Pocahontas%22%2CPocahontas%20Disney%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Disney%2C%20Snow%22%2CSnow%20Disney%2C0%2C97%25%2C2%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPrivate%20Separate%0A%22Duck%2C%20Aladdin%22%2CAladdin%20Duck%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Duck%2C%20Daisy%22%2CDaisy%20Duck%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Duck%2C%20Mowgli%22%2CMowgli%20Duck%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Kenobi%2C%20Aladdin%22%2CAladdin%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Kenobi%2C%20Aladdin%22%2CAladdin%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Kenobi%2C%20Chip%22%2CChip%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Kenobi%2C%20Donald%22%2CDonald%20Kenobi%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Kenobi%2C%20Elsa%22%2CElsa%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Kenobi%2C%20Mari%22%2CMari%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Kenobi%2C%20Mickey%22%2CMickey%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Kenobi%2C%20Minnie%22%2CMinnie%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Kenobi%2C%20Pluto%22%2CPluto%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Kenobi%2C%20Pluto%22%2CPluto%20Kenobi%2C0%2C100%25%2C0%2C%2C%2C%2CA%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Kenobi%2C%20Snow%22%2CSnow%20Kenobi%2C0%2C100%25%2C1%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Mouse%2C%20Aladdin%22%2CAladdin%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Mouse%2C%20Chip%22%2CChip%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Mouse%2C%20Donald%22%2CDonald%20Mouse%2C0%2C97%25%2C0%2C%2C%2C%2CD%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Mouse%2C%20Pluto%22%2CPluto%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Mouse%2C%20Rapunzel%22%2CRapunzel%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Mouse%2C%20Rapunzel%22%2CRapunzel%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0A%22Mouse%2C%20Winnie%22%2CWinnie%20Mouse%2C0%2C97%25%2C0%2C%2C%2C%2CB%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Mouse%2C%20Winnie%22%2CWinnie%20Mouse%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0A%22Pan%2C%20Daisy%22%2CDaisy%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0A%22Pan%2C%20Donald%22%2CDonald%20Pan%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Pan%2C%20Minnie%22%2CMinnie%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Pan%2C%20Mowgli%22%2CMowgli%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Pan%2C%20Mowgli%22%2CMowgli%20Pan%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Pan%2C%20Olaf%22%2COlaf%20Pan%2C0%2C100%25%2C1%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Pan%2C%20Olaf%22%2COlaf%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Pan%2C%20Rapunzel%22%2CRapunzel%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0A%22Pan%2C%20Rapunzel%22%2CRapunzel%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2CA%2C%2C%2C%2C%2C%2C%2C%2CPrivate%20Separate%0A%22Pan%2C%20Rapunzel%22%2CRapunzel%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Pan%2C%20Rapunzel%22%2CRapunzel%20Pan%2C0%2C100%25%2C1%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0A%22Pan%2C%20Snow%22%2CSnow%20Pan%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Poppins%2C%20Aladdin%22%2CAladdin%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Poppins%2C%20Chip%22%2CChip%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Poppins%2C%20Elsa%22%2CElsa%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Poppins%2C%20Mickey%22%2CMickey%20Poppins%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Poppins%2C%20Mickey%22%2CMickey%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Poppins%2C%20Mowgli%22%2CMowgli%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Poppins%2C%20Pocahontas%22%2CPocahontas%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Poppins%2C%20Rapunzel%22%2CRapunzel%20Poppins%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPrivate%20Separate%0A%22Poppins%2C%20Winnie%22%2CWinnie%20Poppins%2C0%2C97%25%2C0%2C%2C%2C%2CB%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0A%22Ren%2C%20Kylo%22%2CKylo%20Ren%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Skywalker%2C%20Aladdin%22%2CAladdin%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Skywalker%2C%20Aladdin%22%2CAladdin%20Skywalker%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Skywalker%2C%20Chip%22%2CChip%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Skywalker%2C%20Daisy%22%2CDaisy%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Skywalker%2C%20Donald%22%2CDonald%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CPartial%20Inclusion%0A%22Skywalker%2C%20Donald%22%2CDonald%20Skywalker%2C0%2C100%25%2C1%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22Skywalker%2C%20Elsa%22%2CElsa%20Skywalker%2C0%2C97%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Skywalker%2C%20Mickey%22%2CMickey%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Skywalker%2C%20Pocahontas%22%2CPocahontas%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22Skywalker%2C%20Pocahontas%22%2CPocahontas%20Skywalker%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22Skywalker%2C%20Snow%22%2CSnow%20Skywalker%2C0%2C97%25%2C0%2C%2C%2C%2CC%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0A%22Solo%2C%20Amir%22%2CAmir%20Solo%2C0%2C100%25%2C0%2C%2C%2C%2CB%2C%2C%2C%2C%2C%2C%2C%2C%0A%22White%2C%20Chip%22%2CChip%20White%2C0%2C97%25%2C0%2C%2C%2C%2CA%2C%2C%2C%2C%2C%2C%2C%2C%0A%22White%2C%20Elsa%22%2CElsa%20White%2C0%2C100%25%2C0%2C%2C%2C%2CD%2C%2C%2C%2C%2C%2C%2C%2CPrivate%20Separate%0A%22White%2C%20Mowgli%22%2CMowgli%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2CFull%20Inclusion%0A%22White%2C%20Mowgli%22%2CMowgli%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22White%2C%20Olaf%22%2COlaf%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A%22White%2C%20Pocahontas%22%2CPocahontas%20White%2C0%2C100%25%2C1%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22White%2C%20Pocahontas%22%2CPocahontas%20White%2C0%2C100%25%2C0%2C%2C%2C%2CA%2C%2C%2C%2C%2C%2C%2C%2C2Way%20English%0A%22White%2C%20Snow%22%2CSnow%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%0A%22White%2C%20Snow%22%2CSnow%20White%2C0%2C100%25%2C0%2C%2C%2C%2CF%2C%2C%2C%2C%2C%2C%2C%2C%0A%22White%2C%20Winnie%22%2CWinnie%20White%2C0%2C100%25%2C0%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C%2C2Way%20Spanish%0A';
  expect($(document.body).find('.DownloadCsvLink').attr('href')).toEqual(csvDownloadHref);
});
