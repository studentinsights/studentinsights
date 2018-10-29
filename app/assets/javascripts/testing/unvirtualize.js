import React from 'react';
import _ from 'lodash';

// react-virtualized is complex and doesn't allow snapshot testing because
// it can't run in jsdom, and doesn't allow snapshotting the full
// content of the data that would be rendered (since it's virtualized).
//
// In tests, it can be useful to just throw the whole data set at a table
// and snapshot how it all renders in a table (eg, for a coarse integration
// test).
//
// This implementation is minimal and fragile, only implementing the
// most bare bones use of <Table/> and <Column/>
export default function unvirtualize(ReactVirtualized, wrapFn) {
  ReactVirtualized.AutoSizer = wrapFn(props => <div className="Mock-AutoSizer">{props.children({width: 1024, height: 768})}</div>);
  ReactVirtualized.Table = wrapFn(tableProps => {
    return (
      <table className="MockReactVirtualized">
        <thead>
          <tr>{tableProps.children.map(column => <td key={column.props.dataKey}>{column.props.label}</td>)}</tr>
        </thead>
        <tbody>
          {_.range(0, tableProps.rowCount).map(index => (
            <tr key={index}>
              {tableProps.children.map(column => (
                <td key={column.props.dataKey}>
                  {column.props.cellRenderer({rowData: tableProps.rowGetter({index})})}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  });
  ReactVirtualized.Column = wrapFn(props => props);
}