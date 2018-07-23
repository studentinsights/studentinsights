import PropTypes from 'prop-types';
import React from 'react';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import HomeroomTable from './HomeroomTable';
import HomeroomNavigator from './HomeroomNavigator';


/*
Homeroom page, for K8 classroom teachers.  Most meaningful the first week or two of school.
*/
export default class HomeroomPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderHomeroom = this.renderHomeroom.bind(this);
  }

  fetchJson() {
    const {homeroomIdOrSlug} = this.props;
    const url = `/api/homerooms/${homeroomIdOrSlug}/homeroom_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="HomeroomPage" style={{...styles.flexVertical, margin: 10}}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderHomeroom} />
      </div>
    );
  }

  renderHomeroom(json) {
    const showStar = json.show_star;
    const showMcas = json.show_mcas;
    const {homeroom, rows, school} = json;
    const homerooms = json.homerooms_by_name;
    return (
      <div style={styles.flexVertical}>
        <SectionHeading>Homeroom: {homeroom.name}</SectionHeading>
        <HomeroomNavigator
          style={styles.navigator}
          homerooms={homerooms} />
        <HomeroomTable
          showStar={showStar}
          showMcas={showMcas}
          rows={rows}
          school={school}
        />
      </div>
    );
  }
}
HomeroomPage.propTypes = {
  homeroomIdOrSlug: PropTypes.string.isRequired
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