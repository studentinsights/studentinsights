import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {testProps} from './ProfileDetails.test';
import FullCaseHistory from './FullCaseHistory';


it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<FullCaseHistory {...props} />, el);
});


it('snapshots view', () => {
  const props = testProps();
  const tree = renderer
    .create(<FullCaseHistory {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});