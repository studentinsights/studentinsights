import SortHelpers from '../helpers/sort_helpers.jsx';

window.shared || (window.shared = {});

const Routes = window.shared.Routes;

export default React.createClass({
  displayName: 'StudentRoster',

  propTypes: {
    students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    columns: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    initialSort: React.PropTypes.string
  },

  getInitialState () {
    return {
      sortBy: this.props.initialSort,
      sortDesc: true
    };
  },

  orderedStudents () {
    const sortedStudents = this.sortedStudents();

    if (!this.state.sortDesc) return sortedStudents.reverse();

    return sortedStudents;
  },

  sortedStudents () {
    const students = this.props.students;
    const sortBy = this.state.sortBy;
    
    return students.sort((a, b) => SortHelpers.sortByString(a, b, sortBy));
  },
    
  onClickHeader(sortBy) {
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy});
    }
  },
  
  render () {
    return (
      <div className='StudentRoster'>
        <table className='students-table' style={{ width: '100%' }}>
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
              <td onClick={this.onClickHeader.bind(null, column.key)}>
                {column.label}
              </td>
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
        {this.orderedStudents().map(student => {
          return (
            <tr key={student.id}>
              {this.props.columns.map(column => {
                return (
                  <td>
                    {this.renderBodyValue(student, column)}
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
