import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Button, {SeriousButton, PlainButton} from './Button';

function testProps(props) {
  return {
    onClick: jest.fn(),
    children: 'Click me!',
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<Button {...testProps()} />, el);
  expect(el.textContent).toContain('Click me!');
});

it('snapshots view', () => {
  const tree = renderer
    .create(
      <div>
        <Button {...testProps()} />
        <PlainButton {...testProps()} />
        <SeriousButton {...testProps()} />
      </div>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});