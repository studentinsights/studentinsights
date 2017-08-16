window.shared || (window.shared = {});

const Routes = window.shared.Routes;

export default React.createClass({
  displayName: 'SectionHeader',

  propTypes: {
    section: React.PropTypes.object.isRequired,
    course: React.PropTypes.object.isRequired,
    educators: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
  },

  handleChangeSection(event) {
    window.location.href = Routes.section(event.target.value)
  },
  
  render () {
    const section = this.props.section;
    const course = this.props.course;

    
    return (
      <div className='SectionHeader'>
        <h1>Section Number: {section.section_number}</h1>
        <p>Course Number: {course.course_number}</p>
        <p>Term: {section.term_local_id}</p>
        <p>Schedule: {section.schedule}</p>
        <p>Room Number: {section.room_number}</p>
        <ul>
          {this.props.educators.map(educator => {
            return (
              <li>
                {educator.full_name}
              </li>
            );
          },this)}
        </ul>
        Section: <select id="section-select" value={section.id} onChange={this.handleChangeSection}>
          {this.props.sections.map(section => {
            return (
              <option key={section.id} value={section.id}>
                {section.section_number}
              </option>
            );
          },this)}
      </select>
      </div>
    );
  }
});
