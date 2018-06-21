import React from 'react';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';
import TieringView from './TieringView';


// Experimental page for looking at HS support tiers
export default class TieringPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchTiering = this.fetchTiering.bind(this);
    this.renderTiering = this.renderTiering.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToRemoveHorizontalScrollbars();
    updateGlobalStylesToTakeFullHeight();
  }

  fetchTiering() {
    const {schoolId} = this.props;
    const url = `/api/tiering/${schoolId}/show_json`;
    return apiFetchJson(url).then(json => json.students_with_tiering);
  }

  render() {
    return (
      <div className="TieringPage" style={styles.flexVertical}>
        <ExperimentalBanner />
        <div style={{margin: 10}}>
          <SectionHeading>HS Levels: v1 prototype</SectionHeading>
        </div>
        <GenericLoader
          promiseFn={this.fetchTiering}
          style={styles.flexVertical}
          render={this.renderTiering} />
      </div>
    );
  }

  renderTiering(studentsWithTiering) {
    return <TieringView studentsWithTiering={studentsWithTiering} />;
  }
}
TieringPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};