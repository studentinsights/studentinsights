import PropTypes from 'prop-types';
import React from 'react';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import SectionTable from './SectionTable';


/*
Section page, for SHS classroom teachers.  Most meaningful the first week or two of school.
*/
export default class SectionPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderSection = this.renderSection.bind(this);
  }

  fetchJson() {
    const {sectionId} = this.props;
    const url = `/api/sections/${sectionId}/section_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="SectionPage" style={{...styles.flexVertical, margin: 10}}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderSection} />
      </div>
    );
  }

  renderSection(json) {
    const {students, section, sections} = json;    
    return (
      <div style={styles.flexVertical}>
        <SectionTable
          students={students}
          section={section}
          sections={sections} />
      </div>
    );
  }
}
SectionPage.propTypes = {
  sectionId: PropTypes.number.isRequired
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  navigator: {
    margin: 10
  }
};