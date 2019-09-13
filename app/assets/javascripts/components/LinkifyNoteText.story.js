import React from 'react';
import {storiesOf} from '@storybook/react';
import LinkifyNoteText from './LinkifyNoteText';


function testCase(text) {
  return (
    <LinkifyNoteText
      text={text}
      safeDomains={[
        'example.com',
        'sub.test.com'
      ]}
    />
  );
}

storiesOf('components/LinkifyNoteText', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div style={{display: 'flex', flexDirection: 'column', margin: 20}}>
        {testCase("hello https://example.com/page goodbye")}
        {testCase("hello https://example.com/page?query=yes goodbye")}
        {testCase("hello https://example.com/page?query=yes+please#also-this goodbye")}
        {testCase("hello https://example.com/ goodbye")}
        {testCase("hello https://example.com goodbye")}
        {testCase("hello https://sub.example.com goodbye")}
        {testCase("hello http://example.com goodbye")}
        {testCase("hello example.com goodbye")}
        {testCase("hello https://sub.test.com/ goodbye")}
        {testCase("hello https://test.com/ goodbye")}
      </div>
    );
  });


