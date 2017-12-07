import React from 'react';
const Routes = window.shared.Routes;

class SectionHeader extends React.Component {

  handleChangeSection(event) {
    window.location.href = Routes.section(event.target.value);
  }

  render () {
    const section = this.props.section;

    return (
      <div className='SectionHeader'>
        <div id="section-header-info">
          <h1>{section.section_number}</h1>
          <p id="course-info">{section.course_description} {'(' + section.course_number + ')'}</p>
          <p id="section-detail">Room {section.room_number} {this.renderBulletSpacer()} Schedule: {section.schedule} {this.renderBulletSpacer()} Term: {section.term_local_id}</p>
        </div>
        <div><p>Section: {this.renderSectionSelector()}</p></div>
      </div>
    );
  }

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
  }

  renderBulletSpacer() {
    return (
      <span>
        •
      </span>
    );
  }
}

SectionHeader.propTypes = {
  section: React.PropTypes.object.isRequired,
  sections: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  educators: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
};

export default SectionHeader;
