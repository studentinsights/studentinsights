import React from 'react';
import renderer from 'react-test-renderer';
import LinkifyNoteText, {_findURLsWithinText, _join} from './LinkifyNoteText';


function testProps(props = {}) {
  return {
    text: 'hello',
    safeDomains: ['example.com', 'sub.test.com'],
    ...props
  };
}

function testCases() {
  return [
    testProps({text: "hello https://example.com/page?query=yes goodbye"}),
    testProps({text: "hello https://example.com/page?query=yes+please#also-this goodbye"}),
    testProps({text: "hello https://example.com/ goodbye"}),
    testProps({text: "hello https://example.com goodbye"}),
    testProps({text: "hello https://sub.example.com goodbye"}),
    testProps({text: "hello http://example.com goodbye"}),
    testProps({text: "hello example.com goodbye"}),
    testProps({text: "hello https://sub.test.com/ goodbye"}),
    testProps({text: "hello https://test.com/ goodbye"})
  ];
}

it('#_findURLsWithinText works', () => {
  const safeDomains = [
    'example.com',
    'sub.test.com'
  ];
  expect(_findURLsWithinText(safeDomains, 'hello https://example.com/page goodbye')).toEqual(['https://example.com/page']);
  expect(_findURLsWithinText(safeDomains, 'hello https://example.com/page?query=yes goodbye')).toEqual(['https://example.com/page?query=yes']);
  expect(_findURLsWithinText(safeDomains, 'hello https://example.com/page?query=yes+please#also-this goodbye')).toEqual(['https://example.com/page?query=yes+please#also-this']);
  expect(_findURLsWithinText(safeDomains, 'hello https://example.com/ goodbye')).toEqual(['https://example.com/']);
  expect(_findURLsWithinText(safeDomains, 'hello https://example.com goodbye')).toEqual(['https://example.com']);
  expect(_findURLsWithinText(safeDomains, 'hello https://sub.example.com goodbye')).toEqual([]);
  expect(_findURLsWithinText(safeDomains, 'hello http://example.com goodbye')).toEqual([]);
  expect(_findURLsWithinText(safeDomains, 'hello example.com goodbye')).toEqual([]);
  expect(_findURLsWithinText(safeDomains, 'hello https://sub.test.com/ goodbye')).toEqual(['https://sub.test.com/']);
  expect(_findURLsWithinText(safeDomains, 'hello https://test.com/ goodbye')).toEqual([]);
});

it('joins', () => {
  function testCase(text) {
    const safeDomains = ['example.com'];
    const urls = _findURLsWithinText(safeDomains, text);
    const pieces = _join(text, urls);
    return pieces;
  }
  

  expect(testCase('hello https://example.com/ goodbye')).toEqual([
    { text: 'hello ' },
    { url: 'https://example.com/' },
    { text: ' goodbye' }
  ]);

  expect(testCase('https://example.com/ goodbye')).toEqual([
    { url: 'https://example.com/' },
    { text: ' goodbye' }
  ]);

  expect(testCase('hello https://example.com/page')).toEqual([
    { text: 'hello ' },
    { url: 'https://example.com/page' }
  ]);
});

it('snapshots across test cases', () => {
  const tree = renderer
    .create(<div>{testCases().map((props, index) => (
      <LinkifyNoteText key={index} {...props} />
    ))}</div>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});