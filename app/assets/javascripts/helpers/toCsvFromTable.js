import {renderToStaticMarkup} from 'react-dom/server';
import _ from 'lodash';


// For converting a react-virtualized table into a CSV in the client for download.
// Reads the `<Column />` definition.
export function toCsvTextFromTable(columns, rows, options = {}) {
  const delimiter = options.delimiter || ',';
  const headers = columns.map(column => column.label.replace(/\s/g, '_'));
  const lines = rows.map(row => toCsvColumns(columns, row).join(delimiter));
  return [headers.join(delimiter)].concat(lines).join("\n");
}

function toCsvColumns(columns, rowData) {
  return columns.map(column => {
    const html = column.cellRenderer({rowData});
    return (html) ? elementAsText(html) : '';
  });
}

function elementAsText(element) {
  return (_.isObject(element))
    ? $(renderToStaticMarkup(element)).text()
    : element;
}
