import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiPutJson, apiPostJson} from '../helpers/apiFetchJson';
import WarnBeforeUnload from '../components/WarnBeforeUnload';
import Loading from '../components/Loading';
import uuidv4 from 'uuid/v4';


export default class SecondTransitionNoteDocumentContext extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      doc: {
        isStarred: false,
        formJson: {
          [STRENGTHS]: '',
          [CONNECTING]: '',
          [COMMUNITY]: '',
          [PEERS]: '',
          [OTHER]: ''
        },
        restrictedText: ''
      },
      pending: {},
      failed: {}
    };

    this.beforeUnloadMessage = this.beforeUnloadMessage.bind(this);
    this.doUpdate = _.throttle(this.doUpdate.bind(this), props.throttleMs);
    this.onDocChanged = this.onDocChanged.bind(this);
  }

  componentDidMount() {
    const requestId = uuidv4();
    this.doCreate()
      .then(json => this.setState({id: json.id}))
      .then(this.onRequestDone.bind(this, requestId))
      .catch(this.onRequestError.bind(this, requestId));
  }

  doCreate() {
    const {studentId} = this.props;
    const {doc} = this.state;
    const url = `/api/students/${studentId}/second_transition_note/create_json`;
    return apiPostJson(url, {form_json: doc.formJson});
  }

  doUpdate(updatedDoc) {
    const {studentId} = this.props;
    const {id, doc} = this.state;
    const url = `/api/students/${studentId}/second_transition_note/${id}/update_json`;
    return apiPutJson(url, {
      second_transition_note_id: id,
      form_json: doc.formJson,
      starred: doc.isStarred,
      restricted_text: doc.restricted_text
    });
  }

  // Doesn't catch changes within throttle window
  beforeUnloadMessage() {
    const {pending} = this.state;
    return _.values(pending).length > 0 ? 'You have unsaved changes.' : undefined;
  }

  onDocChanged(docDiff) {
    const {doc} = this.state;
    const updatedDoc = {
      ...doc,
      ...docDiff
    };

    const requestId = uuidv4();
    this.setState({
      doc: updatedDoc,
      pending: {
        ...this.state.pending,
        [requestId]: {updatedDoc}
      }
    });

    this.doUpdate({updatedDoc})
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
      pending: _.omit(this.state.pending, requestId),
      failed: {
        ...this.state.failed,
        [requestId]: err
      }
    });
  }

  render() {
    const {children} = this.props;
    const {id, doc, pending, failed} = this.state;

    return (
      <WarnBeforeUnload messageFn={this.beforeUnloadMessage}>
        {children({
          id,
          doc,
          pending: _.values(pending),
          failed: _.values(failed),
          onDocChanged: this.onDocChanged
        })}
      </WarnBeforeUnload>
    );
  }
}
SecondTransitionNoteDocumentContext.propTypes = {
  studentId: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
  throttleMs: PropTypes.number
};
SecondTransitionNoteDocumentContext.defaultProps = {
  throttleMs: 2000
};

export const STRENGTHS = 'strengths';
export const CONNECTING = 'connecting';
export const COMMUNITY = 'community';
export const PEERS = 'peers';
export const OTHER = 'other';
