import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import Educator from '../components/Educator';
import Homeroom from '../components/Homeroom';
import School from '../components/School';
import Section from '../components/Section';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import HomePage from '../home/HomePage';


/*
Showing info about an educator.
*/
class EducatorPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchEducator = this.fetchEducator.bind(this);
    this.renderEducator = this.renderEducator.bind(this);
  }

  fetchEducator() {
    const {educatorId} = this.props;
    const url = `/api/educators/${educatorId}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="EducatorPage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchEducator}
          render={this.renderEducator} />
      </div>
    );
  }

  renderEducator(educator) {
    const raw = _.omit(educator, 'sections', 'school', 'homeroom');
    return (
      <div style={styles.rendered}>
        <SectionHeading>Educator info</SectionHeading>
        <div style={styles.columnsContainer}>
          <div style={{flex: 1, padding: 10, fontSize: 14}}>
            <div>Name: <Educator educator={educator} /></div>
            <div>Homeroom: {educator.homeroom
              ? <Homeroom {...educator.homeroom} />
              : 'None'}
            </div>
            <div>School: <School {...educator.school} /></div>
            <div>Sections: {educator.sections.length === 0
              ? 'None'
              : <ul>{educator.sections.map(section =>
                  <li key={section.id}>
                    <Section
                      id={section.id}
                      sectionNumber={section.section_number}
                      courseDescription={section.course_description} />
                    </li>
                )}</ul>}
            </div>
          </div>
          <pre style={{flex: 1, ...styles.raw}}>
            {JSON.stringify(raw, null, 2)}
          </pre>
        </div>
        <SectionHeading>Home page</SectionHeading>
        <HomePage educatorId={educator.id} />
      </div>
    );
  }
}
EducatorPage.propTypes = {
  educatorId: React.PropTypes.number.isRequired
};


const styles = {
  rendered: {
    padding: 10
  },
  columnsContainer: {
    display: 'flex'
  },
  raw: {
    fontFamily: 'monospace',
    fontSize: 10,
    padding: 10
  }
};


export default EducatorPage;