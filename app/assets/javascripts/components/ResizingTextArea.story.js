import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {storiesOf} from '@storybook/react';
import ResizingTextArea from './ResizingTextArea';

function TestCase({defaultText}) {
  const [text, setText] = useState(defaultText);
  useEffect(() => {
    setTimeout(() => setText(text + ' ...ok...\nwait...'), 2000);
    setTimeout(() => setText('short...'), 4000);
    setTimeout(() => setText(text + '\n\ngoodbye!'), 6000);
  }, []);
  const props = {
    value: text,
    onChange: e => setText(e.target.value),
    style: {
      outline: '1px solid black',
      border: 0,
      padding: 0,
      margin: 0
    }
  };
  return <ResizingTextArea {...props} />;
}
TestCase.propTypes = {
  defaultText: PropTypes.string.isRequired
};


storiesOf('components/ResizingTextArea', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div>
        <div style={{padding: 10}}><TestCase defaultText={`hello`} /></div>
        <div style={{padding: 10}}><TestCase defaultText={`hello world`} /></div>
        <div style={{padding: 10}}><TestCase defaultText={`hello\nworld`} /></div>
        <div style={{padding: 10}}><TestCase defaultText={`hello\nworld\n`} /></div>
        <div style={{padding: 10}}><TestCase defaultText={`hello\nworld\nwith\nresizing`} /></div>
      </div>
    );
  });