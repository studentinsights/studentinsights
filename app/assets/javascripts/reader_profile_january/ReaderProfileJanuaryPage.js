import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import RollbarErrorBoundary from '../components/RollbarErrorBoundary';
import ReaderProfileJanuary from './ReaderProfileJanuary';
import {readInstructionalStrategies} from './instructionalStrategies';


// The entry point.  Pieces of this data is read by each of the components,
// both to render their tabs in the overview, and also
// to render the expanded view.
export default class ReaderProfileJanuaryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasClicked: false
    };
    this.onClick = this.onClick.bind(this);
  }
  
  onClick(e) {
    e.preventDefault();
    this.setState({hasClicked: true});
  }

  render() {
    const {hasClicked} = this.state;

    return (
      <RollbarErrorBoundary debugKey="ReaderProfileJanuaryPage">
        <div className="ReaderProfileJanuaryPage">
          <SectionHeading>Reader Profile</SectionHeading>
          {hasClicked ? this.renderSubstance() : this.renderMessage()}
        </div>
      </RollbarErrorBoundary>
    );
  }

  renderMessage() {
    const {student} = this.props;
    return (
      <div style={{padding: 0, margin: 10}}>
        <div style={{display: 'flex', alignItems: 'flex-start', marginTop: 20, lineHeight: '1.5em'}}>
          <div style={{flex: 1, marginRight: 20}}>Reader profiles aim to help facilitate problem-solving discussions around what actions or steps in the classroom or school can help students thrive in as readers.</div>
          <div style={{flex: 1, marginRight: 20}}>Our profiles build from left to right, starting with how students see themselves as a reader, their oral language, and then moving to phonological awareness, phonics, and comprehension.</div>
          <div style={{flex: 1, marginRight: 20}}>As we view the profile, we are also looking for what strengths the students have that we can leverage as we help the student to grow as a reader.</div>          
        </div>
        <button style={{marginTop: 20}} className="btn btn-primary" onClick={this.onClick}>{`${student.first_name}'s profile`}</button>
      </div>
    );
  }

  renderSubstance() {
    const {student} = this.props;
    const url = `/api/students/${student.id}/reader_profile_json`;
    return (
      <GenericLoader
        promiseFn={() => apiFetchJson(url)}
        render={json => this.renderJson(json)} />
    );
  }

  // It provides all data on reader profile and instructional strategies,
  // for individual components to parse how they like.
  renderJson(json) {
    const {student} = this.props;
    return (
      <ReaderProfileJanuary
        student={student}
        readerJson={json}
        instructionalStrategies={readInstructionalStrategies()}
      />
    );
  }
}
ReaderProfileJanuaryPage.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired
};
