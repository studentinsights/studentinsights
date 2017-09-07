window.shared || (window.shared = {});

const Routes = window.shared.Routes;
const styles = {
    titleContainer: {
      fontSize: 16,
      padding: 20,
      display: 'flex'
    },
    nameTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginRight: 5
    },
    titleItem: {
      fontSize: 24,
      padding: 5
    },
    subtitleItem: {
      fontSize: 22,
      padding: 5
    }
  };

export default React.createClass({
  displayName: 'SectionHeader',

  propTypes: {
    section: React.PropTypes.object.isRequired,
    educators: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
  },

  handleChangeSection(event) {
    window.location.href = Routes.section(event.target.value)
  },

  renderSectionSelector() {
    return (
      <span>
        <select id="section-select" value={this.props.section.id} onChange={this.handleChangeSection}>
            {this.props.sections.map(section => {
              return (
                <option key={section.id} value={section.id}>
                  {section.section_number}
                </option>
              );
            },this)}
        </select>
      </span>
    );
  },
  
  renderBulletSpacer: function() {
    return (
      <span>
        •
      </span>
    );
  },
  
  render () {
    const section = this.props.section;

    return (
      <div className='SectionHeader'>
        <div>
          <h1>{section.section_number}</h1>
          <p>{section.course_description} {'(' + section.course_number + ')'}</p>
          <p>Room {section.room_number} {this.renderBulletSpacer()} Schedule: {section.schedule} {this.renderBulletSpacer()} Term: {section.term_local_id}</p>
        </div>
        <div><p>Section: {this.renderSectionSelector()}</p></div>
      </div>
    );
  }
});