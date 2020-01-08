import React from 'react';
import {toCsvTextFromTable} from './toCsvFromTable';

it('wraps values when they contain commas, escapes double quotes', () => {
  /* eslint-disable react/prop-types */
  const columns = [
    { label: 'Name', cellRenderer({rowData}) { return <span>{rowData.name}</span>; } },
    { label: 'Position', cellRenderer({rowData}) { return <span>{rowData.pos}</span>; } }
  ];
  /* eslint-enable react/prop-types */

  const rows = [
    { name: 'Pedro', pos: 'pitcher' },
    { name: '"Nomar"', pos: 'shortstop' },
    { name: 'Ortiz, David', pos: 'DH' }
  ];
  expect(toCsvTextFromTable(columns, rows)).toEqual(
    'Name,Position\n' + 
    'Pedro,pitcher\n' + 
    '"""Nomar""",shortstop\n' + 
    '"Ortiz, David",DH\n'
  );
});
