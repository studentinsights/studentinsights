import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiPutJson, apiPostJson, apiDeleteJson} from '../helpers/apiFetchJson';
import WarnBeforeUnload from '../components/WarnBeforeUnload';
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
    this.doSave = this.doSave.bind(this);
    this.doDelete = this.doDelete.bind(this);
    this.onDocChanged = this.onDocChanged.bind(this);
  }

  anyOutstandingRequests() {
    const {pending, failed} = this.state;
    if (_.values(pending).length > 0) return true;
    if (_.values(failed).length > 0) return true;
    return false;
  }

  beforeUnloadMessage() {
    return this.anyOutstandingRequests()
      ? 'You have unsaved changes.'
      : undefined;
  }

  doSave() {
    const {studentId} = this.props;
    const {id, doc} = this.state;
    const url = `/api/students/${studentId}/second_transition_note/save_json`;
    const postParams =  {
      second_transition_note_id: id,
      form_json: doc.formJson,
      starred: doc.isStarred,
      restricted_text: doc.restrictedText
    };
    return this.trackRequest(doc, () => (
      apiPostJson(url, postParams)
        .then(json => this.setState({id: json.id}))
    ));
  }

  doDelete() {
    const {studentId} = this.props;
    const {id, doc} = this.state;
    const url = `/api/students/${studentId}/second_transition_note/${id}`;
    return this.trackRequest(doc, () => (
      apiDeleteJson(url)
        .then(json => this.setState({id: null}))
    ));
  }

  trackRequest(updatedDoc, requestFn) {
    const requestId = uuidv4();
    this.setState({
      doc: updatedDoc,
      pending: {
        ...this.state.pending,
        [requestId]: {updatedDoc}
      }
    });
    return requestFn()
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

  onDocChanged(docDiff) {
    const {doc} = this.state;
    this.setState({doc: {...doc, ...docDiff}});
  }

  render() {
    const {children} = this.props;
    const {id, doc, pending, failed} = this.state;
    
    return (
      <WarnBeforeUnload messageFn={this.beforeUnloadMessage}>
        {children({
          doc,
          doSave: this.doSave,
          doDelete: id ? this.doDelete : null,
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
  children: PropTypes.func.isRequired
};

export const STRENGTHS = 'strengths';
export const CONNECTING = 'connecting';
export const COMMUNITY = 'community';
export const PEERS = 'peers';
export const OTHER = 'other';
