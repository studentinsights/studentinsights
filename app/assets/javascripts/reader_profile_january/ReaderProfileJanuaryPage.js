import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import RollbarErrorBoundary from '../components/RollbarErrorBoundary';
import ReaderProfileJanuary from './ReaderProfileJanuary';

// The entry point.  Pieces of this data is read by each of the components,
// both to render their tabs in the overview, and also
// to render the expanded view.
export default class ReaderProfileJanuaryPage extends React.Component {
  render() {
    const {student} = this.props;
    const url = `/api/students/${student.id}/reader_profile_json`;

    return (
      <RollbarErrorBoundary debugKey="ReaderProfileJanuaryPage">
        <div className="ReaderProfileJanuaryPage">
          <SectionHeading>Reader Profile, v4 January</SectionHeading>
          <GenericLoader
            promiseFn={() => apiFetchJson(url)}
            render={json => this.renderJson(json)} />
        </div>
      </RollbarErrorBoundary>
    );
  }

  // TODO It fetches the monolithic `readerJson` and  `instructionalStrategiesJson` itself.
  renderJson(json) {
    const {student} = this.props;
    return (
      <ReaderProfileJanuary
        student={student}
        readerJson={json}
        instructionalStrategiesJson={[]}
      />
    );
  }
}
ReaderProfileJanuaryPage.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired
};
