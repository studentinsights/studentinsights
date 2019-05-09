import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import SectionHeading from '../components/SectionHeading';
import {Website, Email} from '../components/PublicLinks';
import WorkBoard from '../components/WorkBoard';


// Page for navigating between schools
// and accessing project lead pages
export default class DistrictOverviewPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  fetchJson() {
    const url = `/api/district/overview_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="DistrictOverviewPage" style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>District</SectionHeading>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    return (
      <DistrictOverviewPageView
        enableStudentVoiceUploads={json.enable_student_voice_uploads}
        showWorkBoard={json.show_work_board}
        schools={json.schools}
        currentEducator={json.current_educator}
      />
    );
  }
}

export class DistrictOverviewPageView extends React.Component {
  render() {
    return (
      <div style={styles.root}>
        <div style={styles.twoColumns}>
          <div style={styles.column}>{this.renderSchoolLinks()}</div>
          <div style={styles.column}>{this.renderProjectLeadLinks()}</div>
        </div>
        {this.renderEquityLinks()}
        {this.renderWorkBoard()}
      </div>
    );
  }

  renderSchoolLinks() {
    const {schools} = this.props;

    return (
      <div>
        <div style={styles.iconAndTitle}>
          {schoolIcon({width: 70, height: 70})}
          <h3 style={styles.columnTitle}>Schools</h3>
        </div>
        <ul style={styles.plainList}>{schools.map(school => {
          return (
            <li key={school.id}>
              <div style={styles.section}>{school.name}</div>
              <div>
                <a style={{...styles.link, paddingRight: 10}} href={`/schools/${school.id}`}>Roster</a>
                <a style={{...styles.link, paddingRight: 10}} href={`/schools/${school.id}/absences`}>Absences</a>
                <a style={{...styles.link, paddingRight: 10}} href={`/schools/${school.id}/tardies`}>Tardies</a>
                <a style={{...styles.link, paddingRight: 10}} href={`/schools/${school.id}/discipline`}>Discipline</a>
              </div>
            </li>
          );
        })}</ul>
      </div>
    );
  }

  renderProjectLeadLinks() {
    const {currentEducator, enableStudentVoiceUploads} = this.props;
    if (!currentEducator.can_set_districtwide_access) return null;

    return (    
      <div>
        <div style={styles.iconAndTitle}>
          {pliersIcon({width: 70, height: 70})}
          <h3 style={styles.columnTitle}>Administration</h3>
        </div>

        <div>
          <div style={styles.section}>Roles and Permissions</div>
          <ul style={styles.plainList}>
            <li>
              <a href="/admin/authorization" style={styles.link}>
               Educator permissions: overview
              </a>
            </li>
            <li>
              <a href="/admin" style={styles.link}>
               Adjust educator permissions
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div style={styles.section}>Syncs and imports</div>
          <ul style={styles.plainList}>
            <li>
              <a href="/service_uploads" style={styles.link}>
               Upload student services file
              </a>
            </li>
            {enableStudentVoiceUploads &&
              <li>
                <a href="/admin/student_voice_survey_uploads" style={styles.link}>
                 Upload student voice survey CSV
                </a>
              </li>
            }
            <li>
              <a href="/admin/import_records" style={styles.link}>
                Import records
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div style={styles.section}>Data quality checks</div>
          <ul style={styles.plainList}>
            <li>
              <a href="/district/enrollment" style={styles.link}>
               Enrollment patterns
              </a>
            </li>
            <li>
              <a href="/admin/sample_students" style={styles.link}>
                Student sample for data quality checks
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  renderEquityLinks() {
    const {schools, currentEducator} = this.props;
    if (currentEducator.labels.indexOf('enable_equity_experiments') === -1) return null;
    
    return (
      <div style={{marginTop: 40}}>
        <SectionHeading>Equity</SectionHeading>
        <ExperimentalBanner />
        <div style={{margin: 20}}>
          <div style={styles.section}>Explore equity (experimental)</div>
          <ul style={styles.plainList}>{schools.map(school => {
            return (
              <li key={school.id}>
                <a href={`/equity/schools/${school.id}/explore`}>{school.name} explorer (experimental)</a>
              </li>
            );
          })}</ul>
          <div style={styles.section}>Quilts visualization of intersectional identities</div>
          <ul style={styles.plainList}>{schools.map(school => {
            return (
              <li key={school.id}>
                <a href={`/equity/schools/${school.id}/quilts`}>{school.name} quilts (experimental)</a>
              </li>
            );
          })}</ul>
          <div style={styles.section}>Other experiments</div>
          <ul style={styles.plainList}>
            <li><a href="/equity/classlists_index" style={styles.link}>
              Class list diversity indexes (experimental)
            </a></li>
            <li><a href="/equity/stats_by_school" style={styles.link}>
              Equity stats across K8 schools (experimental)
            </a></li>
          </ul>
        </div>
      </div>
    );
  }

  renderWorkBoard() {
    const {showWorkBoard} = this.props;
    if (!showWorkBoard) return null;

    return (
      <div style={{marginTop: 40}}>
        <SectionHeading>Student Insights work board</SectionHeading>
        <div style={{margin: 10, marginBottom: 20}}>
          This is how we communicate about what we're working on now,
          and what we think is coming next, across all districts.  Read
          more at <Website /> or share what you're thinking about with us at <Email />.
        </div>
        <div style={{margin: 20, width: '100%', height: 800}}>
          <WorkBoard style={{width: '100%', height: '100%'}} />
        </div>
      </div>
    );
  }
}
DistrictOverviewPageView.propTypes = {
  enableStudentVoiceUploads: PropTypes.bool.isRequired,
  showWorkBoard: PropTypes.bool.isRequired,
  currentEducator: PropTypes.shape({
    can_set_districtwide_access: PropTypes.bool.isRequired,
    admin: PropTypes.bool.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  schools: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  root: {
    fontSize: 14,
    width: '100%',
    margin: 'auto'
  },
  twoColumns: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  column: {
    flex: 1,
    margin: 20
  },
  iconAndTitle: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
  },

  section: {
    fontSize: 18,
    marginTop: 15
  },

  columnTitle: {
    display: 'inline-block',
    color: 'black',
    fontSize: 20,
    marginLeft: 10,
    marginBottom: 20
  },

  link: {
    fontSize: 14
  },

  plainList: {
    listStyleType: 'none',
    paddingLeft: 0
  }
};


function schoolIcon(props = {}) {
  const {width, height} = props;
  return <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg"version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve"><g><path d="M94.862,39.171l-2.722-2.684c-0.447-0.44-0.896-0.88-1.347-1.319c-0.466-0.456-0.932-0.91-1.393-1.365   c-0.22-0.216-0.515-0.337-0.822-0.337H55.02l-4.449-2.972V27.72h9.169V20.7H48.23v3.12v3.9v2.831l-4.363,2.915H11.411   c-0.309,0-0.606,0.123-0.826,0.341c-0.482,0.48-0.973,0.96-1.463,1.44c-0.424,0.414-0.847,0.828-1.265,1.242l-2.72,2.682   c-0.338,0.333-0.441,0.838-0.261,1.277c0.18,0.439,0.608,0.726,1.083,0.726h4.29v35.44h0.039V79.3h25.16h1.17h5.976   c0.646,0,1.17-0.524,1.17-1.17v-1.735h11.181v1.735c0,0.646,0.524,1.17,1.17,1.17h5.975h1.17h25.374v-2.685h0.006v-35.44h5.403   c0.475,0,0.902-0.287,1.082-0.726C95.304,40.009,95.2,39.505,94.862,39.171z M50.57,23.04h6.828v2.34H50.57v-1.56V23.04z    M58.725,69.592V56.88h2.074v12.712H58.725z M40.132,56.88v12.712h-2.074V56.88H40.132z M42.473,59.85v-2.97h5.311   C45.676,57.226,43.816,58.305,42.473,59.85z M56.385,59.817c-1.341-1.528-3.189-2.593-5.282-2.938h5.282V59.817z M62.949,54.54   H35.938v-1.365h27.012V54.54z M46.661,50.835v-9.66h5.537v9.66H46.661z M44.321,41.175v9.66h-1.853v-9.66H44.321z M54.538,50.835   v-9.66h1.853v9.66H54.538z M40.384,38.607l9.06-6.052l9.06,6.052H40.384z M8.813,38.834l0.692-0.682   c0.414-0.412,0.834-0.822,1.253-1.232c0.379-0.372,0.76-0.743,1.135-1.114h28.472l-4.488,2.998   c-0.013,0.008-0.021,0.021-0.033,0.03H10.249H8.813z M40.128,41.175v9.66h-5.361c-0.646,0-1.17,0.524-1.17,1.17v3.705   c0,0.646,0.524,1.17,1.17,1.17h0.951v12.712h-0.271c-0.646,0-1.17,0.524-1.17,1.17v1.039H12.588V41.175H40.128z M12.627,74.141   h21.649v2.819H12.627V74.141z M41.422,76.96h-4.805v-5.028h4.805V76.96z M54.943,70.762v3.293H43.762v-3.293   c0-0.641-0.516-1.16-1.155-1.168v-3.873c0-3.654,2.975-6.629,6.63-6.629h0.412c3.656,0,6.63,2.975,6.63,6.629v3.871h-0.166   C55.468,69.592,54.943,70.116,54.943,70.762z M62.088,76.96h-4.804v-5.028h4.804V76.96z M86.292,76.96H64.428v-2.819h21.864V76.96z    M86.298,71.801h-21.87v-1.039c0-0.646-0.523-1.17-1.17-1.17h-0.119V56.88h0.98c0.646,0,1.17-0.524,1.17-1.17v-3.705   c0-0.646-0.524-1.17-1.17-1.17h-5.388v-9.66h27.566V71.801z M88.638,38.834H63.051c-0.049-0.036-0.095-0.076-0.15-0.104   l-4.378-2.925H88.1c0.353,0.346,0.706,0.691,1.06,1.036c0.447,0.438,0.894,0.875,1.339,1.313l0.69,0.68H88.638z"></path><rect x="16.991" y="58.226" width="2.34" height="3.376"></rect><rect x="16.991" y="64.015" width="2.34" height="3.376"></rect><rect x="27.45" y="45.342" width="2.34" height="3.377"></rect><rect x="27.45" y="51.132" width="2.34" height="3.376"></rect><rect x="79.322" y="58.226" width="2.341" height="3.376"></rect><rect x="79.322" y="64.015" width="2.341" height="3.376"></rect><rect x="63.636" y="45.342" width="2.34" height="3.377"></rect><rect x="22.221" y="58.226" width="2.34" height="3.376"></rect><rect x="22.221" y="64.015" width="2.34" height="3.376"></rect><rect x="27.45" y="58.226" width="2.34" height="3.376"></rect><rect x="27.45" y="64.015" width="2.34" height="3.376"></rect><rect x="22.221" y="45.342" width="2.34" height="3.377"></rect><rect x="22.221" y="51.132" width="2.34" height="3.376"></rect><rect x="16.991" y="45.342" width="2.34" height="3.377"></rect><rect x="16.991" y="51.132" width="2.34" height="3.376"></rect><rect x="32.702" y="45.342" width="2.34" height="3.377"></rect><rect x="68.862" y="45.342" width="2.34" height="3.377"></rect><rect x="68.862" y="51.132" width="2.34" height="3.376"></rect><rect x="74.093" y="45.342" width="2.34" height="3.377"></rect><rect x="74.093" y="51.132" width="2.34" height="3.376"></rect><rect x="79.322" y="45.342" width="2.341" height="3.377"></rect><rect x="79.322" y="51.132" width="2.341" height="3.376"></rect><rect x="74.093" y="58.226" width="2.34" height="3.376"></rect><rect x="74.093" y="64.015" width="2.34" height="3.376"></rect><rect x="68.862" y="58.226" width="2.34" height="3.376"></rect><rect x="68.862" y="64.015" width="2.34" height="3.376"></rect></g></svg>;
}
schoolIcon.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};


function pliersIcon(props = {}) {
  const {width, height, style} = props;
  return <svg style={{transform: 'rotate(50deg)', ...style}} width={width} height={height} xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve"><path fill="#000000" d="M60,42.7c0.6-0.9,0.8-2,0.2-3c-0.5-0.9-1.5-1.4-2.5-1.3V34l3.4-7.6c0.1-0.1,0.1-0.3,0.1-0.5  c0-0.1,0-0.1,0-0.2l-4.9-22c-0.1-0.5-0.5-0.8-1-0.8h-8c-0.5,0-0.9,0.3-1,0.8l-5.2,22c-0.1,0.2,0,0.4,0.1,0.6l3.4,7.6v4.4  c-0.3,0-0.5,0-0.8,0.1c-0.7,0.2-1.3,0.6-1.7,1.2c-0.4,0.6-0.5,1.4-0.3,2.1c0.1,0.4,0.2,0.7,0.5,1c-9.1,14.9-9.8,33.7-1.7,49.2  c0.7,1.4,1.9,2.3,3.3,2.7c0.4,0.1,0.7,0.1,1.1,0.1c0.7,0,1.5-0.2,2.1-0.6c2-1.3,2.6-4,1.4-6.3c-6.7-12.8-6.1-28.4,1.5-40.7  c0.1,0,0.3,0,0.4,0c0.3,0,0.5-0.1,0.8-0.1c0.3,0.1,0.5,0.1,0.8,0.1c0.1,0,0.3,0,0.4,0c7.4,12.5,8,27.7,1.4,40.7  c-1.1,2.3-0.5,5,1.5,6.2c0.6,0.4,1.3,0.6,2,0.6c0.4,0,0.8-0.1,1.1-0.2c1.4-0.4,2.5-1.4,3.2-2.7C69.6,76.1,68.9,57.8,60,42.7z   M58.4,40.7c0.2,0.3,0.1,0.8-0.2,1l-5.8,3.4c-0.1,0-0.1,0.1-0.2,0.1v-1.6l5.3-3.1C57.8,40.3,58.2,40.4,58.4,40.7z M52.2,22  c0.8,0.4,1.4,1.2,1.4,2.2S53,26,52.2,26.3V22z M50.2,26.3c-0.8-0.4-1.4-1.2-1.4-2.2s0.6-1.8,1.4-2.2V26.3z M59.2,25.9l-3.3,7.3  c-0.1,0.2-0.2,0.4-0.2,0.6v5.4l-3.5,2.1V28.5c2-0.5,3.4-2.2,3.4-4.3c0-2.1-1.5-3.9-3.4-4.3V5h2.3L59.2,25.9z M43.2,25.9l5-20.9h2  v14.8c-2,0.5-3.4,2.2-3.4,4.3c0,2.1,1.5,3.9,3.4,4.3v12.8l-3.5-2.1v-5.4c0-0.1,0-0.3-0.1-0.4L43.2,25.9z M44,40.7  c0.1-0.2,0.2-0.3,0.4-0.3c0.2,0,0.4,0,0.5,0.1l5.2,3.1v1.6c0,0-0.1,0-0.1-0.1l-5.8-3.4c-0.2-0.1-0.3-0.2-0.3-0.4  C43.8,41.1,43.9,40.9,44,40.7z M46.7,88.8c0.7,1.3,0.4,3-0.7,3.7c-0.4,0.3-1,0.4-1.5,0.2c-0.8-0.2-1.5-0.8-2-1.7  c-7.7-14.9-7.1-32.8,1.6-47.1l4.1,2.4C40.3,59.2,39.7,75.4,46.7,88.8z M59.9,90.9c-0.4,0.8-1.1,1.5-1.9,1.7  c-0.6,0.2-1.1,0.1-1.6-0.2c-1.1-0.7-1.4-2.3-0.8-3.6c6.8-13.6,6.3-29.4-1.4-42.4l4.1-2.4C66.9,58.4,67.5,75.9,59.9,90.9z"></path></svg>;
}
pliersIcon.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object
};


function SearchIcon(props = {}) {
  const {width, height, style} = props;
  return <svg style={style} width={width} height={height} xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve"><path d="M5,39.86c0,9.311,3.625,18.065,10.21,24.649c6.584,6.585,15.337,10.21,24.65,10.21c8.718,0,16.947-3.179,23.364-8.988  l4.393,4.393c-1.581,2.702-1.24,6.227,1.074,8.541l14.27,14.27C84.292,94.267,86.064,95,87.948,95s3.654-0.734,4.986-2.066  C94.266,91.602,95,89.831,95,87.948s-0.733-3.655-2.066-4.987l-14.27-14.27c-1.332-1.332-3.103-2.065-4.986-2.065  c-1.277,0-2.498,0.344-3.57,0.976l-4.378-4.378c5.81-6.417,8.988-14.646,8.988-23.364c0-9.312-3.625-18.066-10.21-24.65  C57.925,8.625,49.171,5,39.86,5c-9.312,0-18.066,3.625-24.65,10.21C8.625,21.794,5,30.548,5,39.86z M71.197,71.197  c0.663-0.661,1.543-1.026,2.48-1.026c0.936,0,1.817,0.364,2.479,1.026l14.27,14.27c0.663,0.663,1.027,1.543,1.027,2.48  c0,0.936-0.365,1.817-1.027,2.479c-1.325,1.325-3.635,1.324-4.96,0l-14.27-14.27C69.831,74.791,69.831,72.565,71.197,71.197z   M8.546,39.86c0-8.365,3.257-16.228,9.172-22.143S31.495,8.546,39.86,8.546c8.364,0,16.227,3.257,22.142,9.172  s9.172,13.778,9.172,22.143c0,8.364-3.257,16.227-9.172,22.142s-13.778,9.172-22.142,9.172c-8.365,0-16.228-3.257-22.143-9.172  S8.546,48.224,8.546,39.86z"></path><path d="M19.475,40.86c-0.552,0-1-0.448-1-1c0-5.721,2.222-11.094,6.257-15.129c4.037-4.037,9.41-6.261,15.128-6.261  c0.552,0,1,0.448,1,1s-0.448,1-1,1c-5.184,0-10.055,2.015-13.714,5.675c-3.657,3.658-5.671,8.529-5.671,13.715  C20.475,40.413,20.027,40.86,19.475,40.86z"></path><path d="M58.78,58.78c-5.04,5.05-11.76,7.83-18.92,7.83s-13.88-2.78-18.92-7.83c-10.44-10.43-10.44-27.41,0-37.84  c5.04-5.05,11.76-7.83,18.92-7.83s13.88,2.78,18.92,7.83C69.21,31.37,69.21,48.35,58.78,58.78z M39.86,64.24  c6.52,0,12.65-2.53,17.25-7.13c9.51-9.51,9.51-24.99,0-34.5c-4.6-4.6-10.73-7.14-17.25-7.14s-12.65,2.54-17.25,7.14  c-9.51,9.51-9.51,24.99,0,34.5C27.21,61.71,33.34,64.24,39.86,64.24z"></path></svg>;
}
SearchIcon.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object
};
