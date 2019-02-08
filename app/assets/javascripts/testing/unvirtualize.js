import React from 'react';
import PropTypes from 'prop-types';
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
  ReactVirtualized.Table = UnvirtualizedTable;
  ReactVirtualized.Column = wrapFn(props => props);
}

// This is a class component because functional components can't
// have refs attached to them:
// (eg, Error: Uncaught [Error: Warning: Function components cannot be given refs. Attempts to access this ref will fail.%s%s])
class UnvirtualizedTable extends React.Component {
  render() {
    const {children, rowCount, rowGetter} = this.props;
    return (
      <table className="MockReactVirtualized">
        <thead>
          <tr>{children.map(column => <td key={column.props.dataKey}>{column.props.label}</td>)}</tr>
        </thead>
        <tbody>
          {_.range(0, rowCount).map(index => (
            <tr key={index}>
              {children.map(column => (
                <td key={column.props.dataKey}>
                  {column.props.cellRenderer({rowData: rowGetter({index})})}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
UnvirtualizedTable.propTypes = {
  children: PropTypes.node.isRequired,
  rowCount: PropTypes.number,
  rowGetter: PropTypes.func
};
