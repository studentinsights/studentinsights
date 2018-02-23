import React from 'react';
import Api from './Api.js';
import NotesFeedPage from './NotesFeedPage.js';

class PageContainer extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      educatorsIndex: this.props.educatorsIndex,
      eventNotes: this.props.eventNotes,
      eventNoteTypesIndex: this.props.eventNoteTypesIndex,
      daysBackMultiplier: 1,
    };

    this.getEventNotes = this.getEventNotes.bind(this);
    this.incrementDaysBack = this.incrementDaysBack.bind(this);
    this.onClickLoadMoreNotes = this.onClickLoadMoreNotes.bind(this);
  }

  componentWillMount(props, state) {
    this.api = new Api(); 
  }

  getEventNotes(json) {
    this.setState({ educatorsIndex: json.educators_index });
    this.setState({ eventNotes: json.notes });
    this.setState({ eventNoteTypesIndex: json.event_note_types_index });
  }

  incrementDaysBack() {
    let previousMultiplier = this.state.daysBackMultiplier;
    this.setState({ daysBackMultiplier: previousMultiplier += 1 });
  }

  onClickLoadMoreNotes() {
    const onSucceed = this.getEventNotes;
    const incrementMultiplier = this.incrementDaysBack;
  
    this.api.getEventNotesData(this.state.daysBackMultiplier, onSucceed, incrementMultiplier);
  }

  render() {
    return(
      <NotesFeedPage
        educatorsIndex={this.state.educatorsIndex}
        eventNotes={this.state.eventNotes}
        eventNoteTypesIndex={this.state.eventNoteTypesIndex}
        onClickLoadMoreNotes={this.onClickLoadMoreNotes} />
    );
  }

}

PageContainer.propTypes = {
  educatorsIndex: React.PropTypes.object.isRequired,
  eventNotes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  eventNoteTypesIndex: React.PropTypes.object.isRequired,
};

export default PageContainer;
