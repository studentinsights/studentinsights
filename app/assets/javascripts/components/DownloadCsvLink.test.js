import React from 'react';
import ReactDOM from 'react-dom';
import DownloadCsvLink from './DownloadCsvLink';

function testProps(props) {
  return {
    filename: 'foo.csv',
    csvText: 'name,city\nkevin,somerville',
    children: 'Download',
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<DownloadCsvLink {...testProps()} />, el);
});
