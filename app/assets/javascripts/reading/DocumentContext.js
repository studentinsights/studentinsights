import React from 'react';
import PropTypes from 'props-types';
import _ from 'lodash';
import {apiPutJson} from '../helpers/apiFetchJson';


export default class DocumentContext extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: props.initialDoc,
      pending: {},
      failed: {}
    };

    this.onDocChanged = this.onDocChanged.bind(this);
  }

  putChange(params = {}) {
    const {studentId, benchmarkAssessmentKey, value} = params;
    const url = `/api/reading/update_data_point_json`;
    return apiPutJson(url, {
      student_id: studentId,
      benchmark_assessment_key: benchmarkAssessmentKey,
      json: value
    });
  }

  onDocChanged(studentId, benchmarkAssessmentKey, value) {
    const {doc} = this.state;
    const updatedDoc = {
      ...doc,
      [studentId]: {
        ...(doc[studentId] || {}),
        [benchmarkAssessmentKey]: value
      }
    };

    const requestId = _.uniqId();
    this.setState({
      doc: updatedDoc,
      pending: {
        ...this.state.pending,
        [requestId]: {studentId, benchmarkAssessmentKey, value}
      }
    });

    this.putChange({studentId, benchmarkAssessmentKey, value})
      .then(this.onRequestDone.bind(this, requestId))
      .catch(this.onRequestError.bind(this, requestId));
  }

  onRequestDone(requestId) {
    this.setState({
      pending: _.omit(this.state.pending, requestId)
    });
  }
  
  onRequestError(requestId, err) {
    this.setState({
      failed: {
        ...this.state.failed,
        [requestId]: err
      }
    });
  }

  render() {
    const {children} = this.props;
    const {doc, pending, failed} = this.state;
    return children({
      doc,
      pending: _.values(pending),
      failed: _.values(failed),
      onDocChanged: this.onDocChanged
    });
  }
}
DocumentContext.propTypes = {
  initialDoc: PropTypes.any.isRequired,
  children: PropTypes.func.isRequired,
  putJson: PropTypes.func.isRequired
};
