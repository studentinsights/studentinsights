import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import SectionHeading from '../components/SectionHeading';
import LightHelpBubble from './LightHelpBubble';
import NotesList from './NotesList';
import TakeNotes from './TakeNotes';
import TakeNotesTakeTwo from './TakeNotesTakeTwo';


/*
The bottom region of the page, showing notes about the student, services
they are receiving, and allowing users to enter new information about
these as well.
*/
export default class LightNotesDetails extends React.Component {

  constructor(props){
    super(props);

    this.onStartAuthoring = this.onStartAuthoring.bind(this);
    this.onClickTakeNotes = this.onClickTakeNotes.bind(this);
    this.onClickSaveNotes = this.onClickSaveNotes.bind(this);
    this.onCancelNotes = this.onCancelNotes.bind(this);
  }

  isTakingNotes() {
    return (
      this.props.isTakingNotes ||
      this.props.requests.saveNote !== null
    );
  }

  onStartAuthoring() {
    this.setState({isAuthoring: true});
  }

  onClickTakeNotes(event) {
    this.props.onTakingNotesChanged(true);
  }

  onCancelNotes(event) {
    this.props.onTakingNotesChanged(false);
  }

  onClickSaveNotes(eventNoteParams, event) {
    this.props.actions.onClickSaveNotes(eventNoteParams);
    this.props.onTakingNotesChanged(false);
  }

  render() {
    const {student, title, currentEducator} = this.props;
    const {isAuthoring} = this.state;
    const isTakeTwoEnabled = (window.location.search.indexOf('taketwowrite') !== -1);

    return (
      <div className="LightNotesDetails" style={styles.notesContainer}>
        {<SectionHeading titleStyle={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', padding: 2}}>
            <span>{title} for {student.first_name}</span>
            <LightHelpBubble
              title={this.props.helpTitle}
              content={this.props.helpContent} />
          </div>
          <div>
            {!this.isTakingNotes() && this.renderTakeNotesButton()}
            {isTakeTwoEnabled && !isAuthoring && (
              <button
                className="btn take-notes"
                style={{display: 'inline-block', margin: 0}}
                onClick={this.onStartAuthoring}>
                <span><span style={{fontWeight: 'bold', paddingRight: 5}}>+</span><span>v2</span></span>
              </button>
            )}
          </div>
        </SectionHeading>}
        <div>
          {isTakeTwoEnabled && isAuthoring && (
            <TakeNotesTakeTwo
              // onChanged={this.props.actions.onTakeNotesTakeTwoChanged}
              style={{marginTop: 20, marginBottom: 20}}
              educator={currentEducator}
              student={student}
            />
          )}
          {this.isTakingNotes() && this.renderTakeNotesDialog()}
          <NotesList
            currentEducatorId={currentEducator.id}
            feed={this.props.feed}
            canUserAccessRestrictedNotes={currentEducator.can_view_restricted_notes}
            educatorsIndex={this.props.educatorsIndex}
            onSaveNote={this.onClickSaveNotes}
            onEventNoteAttachmentDeleted={this.props.actions.onDeleteEventNoteAttachment} />
        </div>
      </div>
    );
  }

  renderTakeNotesDialog() {
    const {
      currentEducator,
      requests
    } = this.props;

    return (
      <TakeNotes
        // TODO(kr) thread through
        nowMoment={moment.utc()}
        currentEducator={currentEducator}
        onSave={this.onClickSaveNotes}
        onCancel={this.onCancelNotes}
        requestState={requests.saveNote}
        showRestrictedCheckbox={currentEducator.can_view_restricted_notes}
      />
    );
  }

  renderTakeNotesButton() {
    return (
      <button
        className="btn take-notes"
        style={{display: 'inline-block', margin: 0}}
        onClick={this.onClickTakeNotes}>
        <span><span style={{fontWeight: 'bold', paddingRight: 5}}>+</span><span>note</span></span>
      </button>
    );
  }
}

LightNotesDetails.propTypes = {
  student: PropTypes.object.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  currentEducator: PropTypes.shape({
    can_view_restricted_notes: PropTypes.bool.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    onClickSaveNotes: PropTypes.func.isRequired,
    onDeleteEventNoteAttachment: PropTypes.func
  }),
  feed: InsightsPropTypes.feed.isRequired,
  requests: PropTypes.object.isRequired,

  title: PropTypes.string.isRequired,
  helpContent: PropTypes.node.isRequired,
  helpTitle: PropTypes.string.isRequired,
  isTakingNotes: PropTypes.bool.isRequired,
  onTakingNotesChanged: PropTypes.func.isRequired
};


const styles = {
  notesContainer: {
    width: '50%',
    marginRight: 20
  }
};
