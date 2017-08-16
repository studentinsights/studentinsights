window.shared || (window.shared = {});

const Routes = window.shared.Routes;

export default React.createClass({
  displayName: 'StudentRoster',

  propTypes: {
    students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    columns: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
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
              <td>
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
        {this.props.students.map(student => {
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
