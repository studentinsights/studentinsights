import React from 'react';
import {sortByString} from '../helpers/SortHelpers';


// This is a sorted table, pass in a list of objects as `rows`,
// and then `columns` to describe how to sort and label columns.
class FlexibleRoster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortByIndex: this.props.initialSortIndex,
      sortDesc: true
    };
    this.onClickHeader = this.onClickHeader.bind(this);
  }

  orderedRows() {
    const sortedRows = this.sortedRows();

    if (!this.state.sortDesc) return sortedRows.reverse();

    return sortedRows;
  }
  
  sortedRows() {
    const rows = this.props.rows;
    const columns = this.props.columns;
    const sortByIndex = this.state.sortByIndex;
    const key = columns[sortByIndex].key;

    if ('sortFunc' in columns[sortByIndex]) {
      return rows.sort((a,b) => columns[sortByIndex].sortFunc(a,b,key));
    }
    else {
      return rows.sort((a, b) => sortByString(a, b, key));
    }  
  }

  headerClassName (sortByIndex) {
    // Using tablesort classes here for the cute CSS carets,
    // not for the acutal table sorting JS (that logic is handled by this class).

    if (sortByIndex !== this.state.sortByIndex) return 'sort-header';

    if (this.state.sortDesc) return 'sort-header sort-down';

    return 'sort-header sort-up';
  }

  onClickHeader(sortByIndex) {
    if (sortByIndex === this.state.sortByIndex) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortByIndex: sortByIndex});
    }
  }
  
  render() {
    return (
      <div className='FlexibleRoster'>
        <table id='roster-table' className='roster-table' style={{ width: '100%' }}>
          <thead>
            {this.renderSuperHeaders()}
            {this.renderHeaders()}
          </thead>
          {this.renderBody()}
        </table>
      </div>
    );
  }

  renderSuperHeaders() {
    const columns = this.props.columns;
    let superHeaders = [];
    let currentCount = 0;

    for (let i=0; i<columns.length; i++) {
      // group for the current column
      let itemGroup = columns[i].group;

      // group for the next column for comparison
      // set to null if this is the last column
      let nextItemGroup = columns.length > i+1 ? columns[i+1].group : null;

      // count of items with the same group
      // increment in the beginning since colSpan starts at 1
      currentCount++;
      
      // if the current item doesn't equal the next
      // push the super header with a length of currentCount
      // and reset currentCount for a new column group
      if(itemGroup != nextItemGroup) {
        superHeaders.push({label: itemGroup, span: currentCount});
        currentCount = 0;
      }
    }

    return (
      <tr className='column-groups'>
        {superHeaders.map((superHeader, index) => {
          return (
            <th key={index} className={superHeader.label == null ? '' : 'column-group'} colSpan={superHeader.span}>
              {superHeader.label}
            </th>
          );
        }, this)}
      </tr>
    );
  }

  renderHeaders() {
    return (
      <tr id='roster-header'>
        {this.props.columns.map((column, index) => {
          return (
            <th key={column.key} onClick={this.onClickHeader.bind(null, index)}
                className={this.headerClassName(index)}>
              {column.label}
            </th>
          );
        }, this)}
      </tr>
    );
  }

  renderBodyValue(item, column) {
    if ('cell' in column) {
      return column.cell(item,column);
    } 
    else {
      return item[column.key];
    }
  }

  renderBody() {
    return (
      <tbody id='roster-data'>
        {this.orderedRows().map((row, index) => {
          const style = (index % 2 === 0)
                    ? { backgroundColor: '#FFFFFF' }
                    : { backgroundColor: '#F7F7F7' };
          
          return (
            <tr key={row.id} style={style}>
              {this.props.columns.map(column => {
                return (
                  <td key={row.id + column.key}>
                    {this.renderBodyValue(row, column)}
                  </td>
                );
              }, this)}
            </tr>
          );
        }, this)}
      </tbody>
    );
  }
}

FlexibleRoster.propTypes = {
  rows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  columns: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  initialSortIndex: React.PropTypes.number
};

export default FlexibleRoster;