import React from 'react';
import PropTypes from 'prop-types';

import SchoolwideTardies from './SchoolwideTardies';
import {apiFetchJson} from '../../../helpers/apiFetchJson';

class TardiesDataLoader extends React.Component {
  //This class just grabs tardy data from the server endpoint before loading the rest of the tardies dashboard
  constructor(props) {
    super(props);
    this.state = {
      dashboardStudents: this.props.dashboardStudents,
      isLoading: false
    };
  }

  componentWillMount() {
    const url = `/api/schools/${this.props.schoolId}/tardies_dashboard_data`;
    this.setState({isLoading: true});

    apiFetchJson(url)
      .then(response => { this.setState({dashboardStudents: response, isLoading: false}); });
  }

  render() {
    const {dashboardStudents, isLoading} = this.state;

    if (isLoading) {
      return <p>Loading ...</p>;
    }

    return (
        <SchoolwideTardies dashboardStudents={dashboardStudents}/>);
  }

}

TardiesDataLoader.propTypes = {
  dashboardStudents: PropTypes.array.isRequired,
  schoolId: PropTypes.string
};

export default TardiesDataLoader;
