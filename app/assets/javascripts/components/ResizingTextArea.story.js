import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
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
    containerStyle: {
      fontSize: 14
    },
    style: {
      outline: '1px solid black',
      fontSize: 14,
      width: 300,
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

const longText = _.repeat('This is a really long sentence with many different clauses saying many, many important things.\n\n', 20);


storiesOf('components/ResizingTextArea', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div>
        <h2>test cases</h2>
        <p>
          This cannot be tested in jest because jsdom does not have a layout engine.  So this is to
          help with manual testing across browsers.

          Try:
          <ol>
            <li>passive: load, and watch it add text and expand to fit, remove text and contract, then add and expand again</li>
            <li>passive: confirm above works with edge cases like trailing newline</li>
            <li>interactive: load, scroll all the way down.  after first transition, screen should stay scrolled down until transition to short text.</li>
            <li>interactive: after transitions, scroll down on long text.  when editing, scroll should not jump at all</li>
            <li>interactive: after transitions, delete chunk of long text.  textarea ahouls contract, with no unexpected scroll or cursor jumps.</li>
          </ol>
        </p>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{flex: 1}}>
            <div style={{padding: 10}}><TestCase defaultText={`hello1`} /></div>
            <div style={{padding: 10}}><TestCase defaultText={`hello world`} /></div>
            <div style={{padding: 10}}><TestCase defaultText={`hello\nworld`} /></div>
            <div style={{padding: 10}}><TestCase defaultText={`hello\nworld\n`} /></div>
            <div style={{padding: 10}}><TestCase defaultText={`hello\nworld\nwith\nresizing`} /></div>
          </div>
          <div style={{flex: 1}}>
            <div style={{padding: 10}}><TestCase defaultText={longText} /></div>
          </div>
        </div>
      </div>
    );
  });