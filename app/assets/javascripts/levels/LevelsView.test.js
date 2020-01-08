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
  const csvDownloadHref = 'data:attachment/csv,Student_name_reversed%09Student%09Level%09Attendance_Rate%09Discipline_Incidents%09EN_or_ELL%09Social_Studies%09Math%09Science%09Last_xGE_or_NEST%09Last_SST%09Last_Counselor%09Study_skills%09Academic_Support%09Redirect%09Credit_Recovery%09Program_or_SPED%0ADisney%2C%20Aladdin%09Aladdin%20Disney%090%09100%25%090%09%09%09%09C%09%09%09%09%09%09%09%092Way%20English%0ADisney%2C%20Chip%09Chip%20Disney%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09Partial%20Inclusion%0ADisney%2C%20Daisy%09Daisy%20Disney%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0ADisney%2C%20Elsa%09Elsa%20Disney%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20English%0ADisney%2C%20Minnie%09Minnie%20Disney%090%09100%25%090%09%09%09%09F%09%09%09%09%09%09%09%09%0ADisney%2C%20Minnie%09Minnie%20Disney%090%09100%25%090%09%09%09%09F%09%09%09%09%09%09%09%09Partial%20Inclusion%0ADisney%2C%20Pocahontas%09Pocahontas%20Disney%090%0997%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0ADisney%2C%20Snow%09Snow%20Disney%090%0997%25%092%09%09%09%09%09%09%09%09%09%09%09%09Private%20Separate%0ADuck%2C%20Aladdin%09Aladdin%20Duck%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0ADuck%2C%20Daisy%09Daisy%20Duck%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0ADuck%2C%20Mowgli%09Mowgli%20Duck%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0AKenobi%2C%20Aladdin%09Aladdin%20Kenobi%090%09100%25%090%09%09%09%09F%09%09%09%09%09%09%09%09%0AKenobi%2C%20Aladdin%09Aladdin%20Kenobi%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0AKenobi%2C%20Chip%09Chip%20Kenobi%090%09100%25%090%09%09%09%09F%09%09%09%09%09%09%09%09%0AKenobi%2C%20Donald%09Donald%20Kenobi%090%0997%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0AKenobi%2C%20Elsa%09Elsa%20Kenobi%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0AKenobi%2C%20Mari%09Mari%20Kenobi%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0AKenobi%2C%20Mickey%09Mickey%20Kenobi%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0AKenobi%2C%20Minnie%09Minnie%20Kenobi%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0AKenobi%2C%20Pluto%09Pluto%20Kenobi%090%09100%25%090%09%09%09%09C%09%09%09%09%09%09%09%092Way%20English%0AKenobi%2C%20Pluto%09Pluto%20Kenobi%090%09100%25%090%09%09%09%09A%09%09%09%09%09%09%09%092Way%20Spanish%0AKenobi%2C%20Snow%09Snow%20Kenobi%090%09100%25%091%09%09%09%09%09%09%09%09%09%09%09%092Way%20English%0AMouse%2C%20Aladdin%09Aladdin%20Mouse%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0AMouse%2C%20Chip%09Chip%20Mouse%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0AMouse%2C%20Donald%09Donald%20Mouse%090%0997%25%090%09%09%09%09D%09%09%09%09%09%09%09%09%0AMouse%2C%20Pluto%09Pluto%20Mouse%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0AMouse%2C%20Rapunzel%09Rapunzel%20Mouse%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0AMouse%2C%20Rapunzel%09Rapunzel%20Mouse%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09Partial%20Inclusion%0AMouse%2C%20Winnie%09Winnie%20Mouse%090%0997%25%090%09%09%09%09B%09%09%09%09%09%09%09%092Way%20Spanish%0AMouse%2C%20Winnie%09Winnie%20Mouse%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09Partial%20Inclusion%0APan%2C%20Daisy%09Daisy%20Pan%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09Full%20Inclusion%0APan%2C%20Donald%09Donald%20Pan%090%0997%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0APan%2C%20Minnie%09Minnie%20Pan%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0APan%2C%20Mowgli%09Mowgli%20Pan%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20English%0APan%2C%20Mowgli%09Mowgli%20Pan%090%0997%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20English%0APan%2C%20Olaf%09Olaf%20Pan%090%09100%25%091%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0APan%2C%20Olaf%09Olaf%20Pan%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0APan%2C%20Rapunzel%09Rapunzel%20Pan%090%09100%25%090%09%09%09%09C%09%09%09%09%09%09%09%09Full%20Inclusion%0APan%2C%20Rapunzel%09Rapunzel%20Pan%090%09100%25%090%09%09%09%09A%09%09%09%09%09%09%09%09Private%20Separate%0APan%2C%20Rapunzel%09Rapunzel%20Pan%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20English%0APan%2C%20Rapunzel%09Rapunzel%20Pan%090%09100%25%091%09%09%09%09%09%09%09%09%09%09%09%09Full%20Inclusion%0APan%2C%20Snow%09Snow%20Pan%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0APoppins%2C%20Aladdin%09Aladdin%20Poppins%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0APoppins%2C%20Chip%09Chip%20Poppins%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0APoppins%2C%20Elsa%09Elsa%20Poppins%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0APoppins%2C%20Mickey%09Mickey%20Poppins%090%0997%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0APoppins%2C%20Mickey%09Mickey%20Poppins%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20English%0APoppins%2C%20Mowgli%09Mowgli%20Poppins%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0APoppins%2C%20Pocahontas%09Pocahontas%20Poppins%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0APoppins%2C%20Rapunzel%09Rapunzel%20Poppins%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09Private%20Separate%0APoppins%2C%20Winnie%09Winnie%20Poppins%090%0997%25%090%09%09%09%09B%09%09%09%09%09%09%09%09Full%20Inclusion%0ARen%2C%20Kylo%09Kylo%20Ren%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0ASkywalker%2C%20Aladdin%09Aladdin%20Skywalker%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20English%0ASkywalker%2C%20Aladdin%09Aladdin%20Skywalker%090%0997%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20English%0ASkywalker%2C%20Chip%09Chip%20Skywalker%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0ASkywalker%2C%20Daisy%09Daisy%20Skywalker%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0ASkywalker%2C%20Donald%09Donald%20Skywalker%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09Partial%20Inclusion%0ASkywalker%2C%20Donald%09Donald%20Skywalker%090%09100%25%091%09%09%09%09C%09%09%09%09%09%09%09%092Way%20English%0ASkywalker%2C%20Elsa%09Elsa%20Skywalker%090%0997%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0ASkywalker%2C%20Mickey%09Mickey%20Skywalker%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0ASkywalker%2C%20Pocahontas%09Pocahontas%20Skywalker%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0ASkywalker%2C%20Pocahontas%09Pocahontas%20Skywalker%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0ASkywalker%2C%20Snow%09Snow%20Skywalker%090%0997%25%090%09%09%09%09C%09%09%09%09%09%09%09%09Full%20Inclusion%0ASolo%2C%20Amir%09Amir%20Solo%090%09100%25%090%09%09%09%09B%09%09%09%09%09%09%09%09%0AWhite%2C%20Chip%09Chip%20White%090%0997%25%090%09%09%09%09A%09%09%09%09%09%09%09%09%0AWhite%2C%20Elsa%09Elsa%20White%090%09100%25%090%09%09%09%09D%09%09%09%09%09%09%09%09Private%20Separate%0AWhite%2C%20Mowgli%09Mowgli%20White%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09Full%20Inclusion%0AWhite%2C%20Mowgli%09Mowgli%20White%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0AWhite%2C%20Olaf%09Olaf%20White%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish%0AWhite%2C%20Pocahontas%09Pocahontas%20White%090%09100%25%091%09%09%09%09%09%09%09%09%09%09%09%09%0AWhite%2C%20Pocahontas%09Pocahontas%20White%090%09100%25%090%09%09%09%09A%09%09%09%09%09%09%09%092Way%20English%0AWhite%2C%20Snow%09Snow%20White%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%09%0AWhite%2C%20Snow%09Snow%20White%090%09100%25%090%09%09%09%09F%09%09%09%09%09%09%09%09%0AWhite%2C%20Winnie%09Winnie%20White%090%09100%25%090%09%09%09%09%09%09%09%09%09%09%09%092Way%20Spanish';
  expect($(document.body).find('.DownloadCsvLink').attr('href')).toEqual(csvDownloadHref);
});
