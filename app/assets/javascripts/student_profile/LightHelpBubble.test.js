import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import renderer from 'react-test-renderer';
import LightHelpBubble from './LightHelpBubble';

function testProps(props) {
  return {
    title: "Hello",
    content: <div>message</div>,
    ...props
  };
}

it('opens dialog on click', () => {
  const el = document.createElement('div');
  ReactDOM.render(<LightHelpBubble {...testProps()} />, el);
  expect(el.innerHTML).not.toContain('Hello');
  expect(el.innerHTML).not.toContain('message');

  ReactTestUtils.Simulate.click($(el).find('a').get(0));
  // the modal isn't in the same part of the DOM
  expect(window.document.body.innerHTML).toContain('Hello');
  expect(window.document.body.innerHTML).toContain('message');
});

it('snapshots view', () => {
  const tree = renderer
    .create(<LightHelpBubble {...testProps()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});