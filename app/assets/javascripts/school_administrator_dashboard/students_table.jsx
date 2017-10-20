
window.shared || (window.shared = {});

export default React.createClass({
  displayName: 'StudentsTable',

  propTypes: {
    rows: React.PropTypes.array.isRequired
  },

  render: function() {
    console.log(this.props.rows);
    return(
      <div className= 'StudentsList'>
        <table className='students-list' style={{width: '100%'}}>
          <thead>
            <tr>
              <td>
                {"Last Name"}
              </td>
              <td>
                {"First Name"}
              </td>
              <td>
                {"Absences"}
              </td>
            </tr>
          </thead>
          <tbody>
            {this.props.rows.map((student) => {
              return (
                <tr>
                  <td>
                    {student.last_name}
                  </td>
                  <td>
                    {student.first_name}
                  </td>
                  <td>
                    {student.absences}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

});
