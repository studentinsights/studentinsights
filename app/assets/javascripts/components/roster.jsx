import SortHelpers from '../helpers/sort_helpers.jsx';

window.shared || (window.shared = {});

const Routes = window.shared.Routes;

export default React.createClass({
  displayName: 'Roster',

  propTypes: {
    rows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    columns: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    initialSort: React.PropTypes.string
  },

  getInitialState () {
    return {
      sortBy: this.props.initialSort,
      sortDesc: true
    };
  },

  orderedRows () {
    const sortedRows = this.sortedRows();

    if (!this.state.sortDesc) return sortedRows.reverse();

    return sortedRows;
  },

  sortedRows () {
    const rows = this.props.rows;
    const sortBy = this.state.sortBy;
    
    return rows.sort((a, b) => SortHelpers.sortByString(a, b, sortBy));
  },
    
  onClickHeader(sortBy) {
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy});
    }
  },

  headerClassName (sortBy) {
    // Using tablesort classes here for the cute CSS carets,
    // not for the acutal table sorting JS (that logic is handled by this class).

    if (sortBy !== this.state.sortBy) return 'sort-header';

    if (this.state.sortDesc) return 'sort-header sort-down';

    return 'sort-header sort-up';
  },
  
  render () {
    return (
      <div className='Roster'>
        <table className='roster-table' style={{ width: '100%' }}>
          {this.renderHeaders()}
          {this.renderBody()}
        </table>
      </div>
    );
  },

  renderHeaders() {
    return (
      <thead>
        <tr>
          {this.props.columns.map(column => {
            return (
              <th onClick={this.onClickHeader.bind(null, column.key)}
                  className={this.headerClassName(column.key)}>
                {column.label}
              </th>
          );
        }, this)}
        </tr>
      </thead>
    );
  },

  renderBodyValue(item, column) {
    if ('cell' in column) {
      return column.cell(item,column);
    } 
    else {
      return item[column.key]
    }
  },

  renderBody() {
    return (
      <tbody>
        {this.orderedRows().map(row => {
          return (
            <tr key={row.id}>
              {this.props.columns.map(column => {
                return (
                  <td>
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
});
