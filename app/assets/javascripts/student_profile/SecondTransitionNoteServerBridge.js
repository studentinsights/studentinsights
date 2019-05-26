import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiPostJson, apiDeleteJson} from '../helpers/apiFetchJson';
import WarnBeforeUnload from '../components/WarnBeforeUnload';
import uuidv4 from 'uuid/v4';


export default class SecondTransitionNoteServerBridge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.initialId,
      doc: props.initialDoc,
      pending: {},
      failed: {},
      lastSyncedDoc: props.initialDoc
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

  isDirty() {
    const {lastSyncedDoc, doc} = this.state;
    if (!_.isEqual(lastSyncedDoc, doc)) return true;
    return false;
  }

  beforeUnloadMessage() {
    return (this.isDirty() || this.anyOutstandingRequests())
      ? 'You have unsaved changes.'
      : undefined;
  }

  doSave() {
    const {studentId} = this.props;
    const {id, doc} = this.state;
    const url = `/api/students/${studentId}/second_transition_notes/save_json`;
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
    const url = `/api/students/${studentId}/second_transition_notes/${id}`;
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
      .then(this.onRequestDone.bind(this, requestId, updatedDoc))
      .catch(this.onRequestError.bind(this, requestId));
  }

  onRequestDone(requestId, updatedDoc) {
    this.setState({
      pending: _.omit(this.state.pending, requestId),
      lastSyncedDoc: updatedDoc
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
          isDirty: this.isDirty(),
          pending: _.values(pending),
          failed: _.values(failed),
          onDocChanged: this.onDocChanged
        })}
      </WarnBeforeUnload>
    );
  }
}
SecondTransitionNoteServerBridge.propTypes = {
  studentId: PropTypes.number.isRequired,
  initialDoc: PropTypes.any.isRequired,
  children: PropTypes.func.isRequired,
  initialId: PropTypes.number
};
