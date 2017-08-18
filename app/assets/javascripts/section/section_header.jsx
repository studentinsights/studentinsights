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
        Section: <select id="section-select" value={this.props.section.id} onChange={this.handleChangeSection}>
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
      <span style={styles.subtitleItem}>
        •
      </span>
    );
  },
  
  render () {
    const section = this.props.section;

    
    return (
      <div>
        <div>{this.renderSectionSelector()}</div>
        <div style={styles.titleContainer}>
          <div style={{ display: 'inline-block', flex: 'auto' }}>
            <div style={{ display: 'inline-block' }}>
              <p style={styles.nameTitle}>Section {section.section_number}</p>
            </div>
            <div id='sectionHeaderData' style={{ display: 'inline-block' }}>
              {this.renderBulletSpacer()}
              <span style={styles.subtitleItem}>
                {section.course_description} ({section.course_number})
              </span>
              {this.renderBulletSpacer()}
              <span style={styles.subtitleItem}>
                {section.term_local_id}
              </span>
              {this.renderBulletSpacer()}
              <span style={styles.subtitleItem}>
                Room {section.room_number}
              </span>
              {this.renderBulletSpacer()}
              <span style={styles.subtitleItem}>
                {section.schedule}
                </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
