import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';


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
      <div className="DistrictOverviewPage" style={styles.flexVertical}>
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
        schools={json.schools}
        currentEducator={json.current_educator}
      />
    );
  }
}


export class DistrictOverviewPageView extends React.Component {
  render() {
    const {schools, currentEducator} = this.props;
    const columnClassName = (currentEducator.admin ?'' : 'only-column');

    return (
      <div id="page-wrapper">
        <h2 id="searchbar-title">
          {searchIcon({width: 45, height: 45})}
          Student Search
        </h2>
        <input id="big-searchbar" className="student-searchbar" />
        <div id="lower-area-wrapper">
          <div className={`lower-area-column ${columnClassName}`}>
            {schoolIcon({width: 70, height: 70})}
            <div className="column-content">
              <h3 className="column-title">
                School Data Overview
              </h3>
              <ul>{schools.map(school => {
                return (
                  <li className="school-name">
                    {school.name}
                    <br/>
                    <a href={`/schools/${school.id}`}>Roster</a>
                    <a href={`/schools/${school.id}/absences`}>Absences</a>
                    <a href={`/schools/${school.id}/tardies`}>Tardies</a>
                  </li>
                );
              })}</ul>
            </div>
          </div>
          {this.renderProjectLeadLinks()}
        </div>
      </div>
    );
  }

  renderProjectLeadLinks() {
    const {currentEducator} = this.props;
    if (!currentEducator.can_set_districtwide_access) return null;

    //<% if PerDistrict.new.enabled_student_voice_survey_uploads? && current_educator.labels.include?('can_upload_student_voice_surveys') %>
    const isStudentVoiceUploadsEnabled = true;
    return (    
      <div className="lower-area-column">
        {pliersIcon({width: 70, height: 70})}
        <div className="column-content">
          <h3 className="column-title">
            Administration
          </h3>
          <ul>
            <li>
              <a href="/admin/authorization" className="prominent-link">
               Educator permissions: overview
              </a>
            </li>
            <li>
              <a href="/admin" className="prominent-link">
               Adjust educator permissions
              </a>
            </li>
            <li>
              <a href="/district/enrollment" className="prominent-link">
               Enrollment patterns
              </a>
            </li>
            <li>
              <a href="/service_uploads" className="prominent-link">
               Upload student services file
              </a>
            </li>
            {isStudentVoiceUploadsEnabled &&
              <li>
                <a href="/admin/student_voice_survey_uploads" className="prominent-link">
                 Upload student voice survey CSV
                </a>
              </li>
            }
            <li>
              <a href="/admin/import_records" className="prominent-link">
                Import records
              </a>
            </li>
            <li>
              <a href="/admin/sample_students" className="prominent-link">
                Student sample for data quality checks
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
DistrictOverviewPageView.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
DistrictOverviewPageView.propTypes = {
  currentEducator: PropTypes.shape({
    can_set_districtwide_access: PropTypes.bool.isRequired,
    admin: PropTypes.bool.isRequired
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
  }
};


function searchIcon(props = {}) {
  const {width, height} = props;
  return <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path d="M94.862,39.171l-2.722-2.684c-0.447-0.44-0.896-0.88-1.347-1.319c-0.466-0.456-0.932-0.91-1.393-1.365   c-0.22-0.216-0.515-0.337-0.822-0.337H55.02l-4.449-2.972V27.72h9.169V20.7H48.23v3.12v3.9v2.831l-4.363,2.915H11.411   c-0.309,0-0.606,0.123-0.826,0.341c-0.482,0.48-0.973,0.96-1.463,1.44c-0.424,0.414-0.847,0.828-1.265,1.242l-2.72,2.682   c-0.338,0.333-0.441,0.838-0.261,1.277c0.18,0.439,0.608,0.726,1.083,0.726h4.29v35.44h0.039V79.3h25.16h1.17h5.976   c0.646,0,1.17-0.524,1.17-1.17v-1.735h11.181v1.735c0,0.646,0.524,1.17,1.17,1.17h5.975h1.17h25.374v-2.685h0.006v-35.44h5.403   c0.475,0,0.902-0.287,1.082-0.726C95.304,40.009,95.2,39.505,94.862,39.171z M50.57,23.04h6.828v2.34H50.57v-1.56V23.04z    M58.725,69.592V56.88h2.074v12.712H58.725z M40.132,56.88v12.712h-2.074V56.88H40.132z M42.473,59.85v-2.97h5.311   C45.676,57.226,43.816,58.305,42.473,59.85z M56.385,59.817c-1.341-1.528-3.189-2.593-5.282-2.938h5.282V59.817z M62.949,54.54   H35.938v-1.365h27.012V54.54z M46.661,50.835v-9.66h5.537v9.66H46.661z M44.321,41.175v9.66h-1.853v-9.66H44.321z M54.538,50.835   v-9.66h1.853v9.66H54.538z M40.384,38.607l9.06-6.052l9.06,6.052H40.384z M8.813,38.834l0.692-0.682   c0.414-0.412,0.834-0.822,1.253-1.232c0.379-0.372,0.76-0.743,1.135-1.114h28.472l-4.488,2.998   c-0.013,0.008-0.021,0.021-0.033,0.03H10.249H8.813z M40.128,41.175v9.66h-5.361c-0.646,0-1.17,0.524-1.17,1.17v3.705   c0,0.646,0.524,1.17,1.17,1.17h0.951v12.712h-0.271c-0.646,0-1.17,0.524-1.17,1.17v1.039H12.588V41.175H40.128z M12.627,74.141   h21.649v2.819H12.627V74.141z M41.422,76.96h-4.805v-5.028h4.805V76.96z M54.943,70.762v3.293H43.762v-3.293   c0-0.641-0.516-1.16-1.155-1.168v-3.873c0-3.654,2.975-6.629,6.63-6.629h0.412c3.656,0,6.63,2.975,6.63,6.629v3.871h-0.166   C55.468,69.592,54.943,70.116,54.943,70.762z M62.088,76.96h-4.804v-5.028h4.804V76.96z M86.292,76.96H64.428v-2.819h21.864V76.96z    M86.298,71.801h-21.87v-1.039c0-0.646-0.523-1.17-1.17-1.17h-0.119V56.88h0.98c0.646,0,1.17-0.524,1.17-1.17v-3.705   c0-0.646-0.524-1.17-1.17-1.17h-5.388v-9.66h27.566V71.801z M88.638,38.834H63.051c-0.049-0.036-0.095-0.076-0.15-0.104   l-4.378-2.925H88.1c0.353,0.346,0.706,0.691,1.06,1.036c0.447,0.438,0.894,0.875,1.339,1.313l0.69,0.68H88.638z"></path><rect x="16.991" y="58.226" width="2.34" height="3.376"></rect><rect x="16.991" y="64.015" width="2.34" height="3.376"></rect><rect x="27.45" y="45.342" width="2.34" height="3.377"></rect><rect x="27.45" y="51.132" width="2.34" height="3.376"></rect><rect x="79.322" y="58.226" width="2.341" height="3.376"></rect><rect x="79.322" y="64.015" width="2.341" height="3.376"></rect><rect x="63.636" y="45.342" width="2.34" height="3.377"></rect><rect x="22.221" y="58.226" width="2.34" height="3.376"></rect><rect x="22.221" y="64.015" width="2.34" height="3.376"></rect><rect x="27.45" y="58.226" width="2.34" height="3.376"></rect><rect x="27.45" y="64.015" width="2.34" height="3.376"></rect><rect x="22.221" y="45.342" width="2.34" height="3.377"></rect><rect x="22.221" y="51.132" width="2.34" height="3.376"></rect><rect x="16.991" y="45.342" width="2.34" height="3.377"></rect><rect x="16.991" y="51.132" width="2.34" height="3.376"></rect><rect x="32.702" y="45.342" width="2.34" height="3.377"></rect><rect x="68.862" y="45.342" width="2.34" height="3.377"></rect><rect x="68.862" y="51.132" width="2.34" height="3.376"></rect><rect x="74.093" y="45.342" width="2.34" height="3.377"></rect><rect x="74.093" y="51.132" width="2.34" height="3.376"></rect><rect x="79.322" y="45.342" width="2.341" height="3.377"></rect><rect x="79.322" y="51.132" width="2.341" height="3.376"></rect><rect x="74.093" y="58.226" width="2.34" height="3.376"></rect><rect x="74.093" y="64.015" width="2.34" height="3.376"></rect><rect x="68.862" y="58.226" width="2.34" height="3.376"></rect><rect x="68.862" y="64.015" width="2.34" height="3.376"></rect></g></svg>;
}

function pliersIcon(props = {}) {
  return 'pliers';
}

function schoolIcon(props = {}) {
  return 'school';
}
