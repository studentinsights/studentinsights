import {renderToStaticMarkup} from 'react-dom/server';
import csvStringify from 'csv-stringify/lib/sync';

// For converting a react-virtualized table into a CSV in the client for download.
// Reads the `<Column />` definition for `label` and `cellRenderer`.
// Minimal implementation for reading Column and for escaping.
export function toCsvTextFromTable(columns, rows, options = {}) {
  const headers = columns.map(column => column.label.replace(/\s/g, '_'));
  const records = rows.map(row => toCsvColumns(columns, row));
  return csvStringify(records, {
    header: true,
    columns: headers,
    ...options
  });
}

function toCsvColumns(columns, rowData) {
  return columns.map(column => {
    const html = column.cellRenderer({rowData});
    return (html) ? elementAsText(html) : '';
  });
}

function elementAsText(element) {
  return $(renderToStaticMarkup(element)).text();
}
