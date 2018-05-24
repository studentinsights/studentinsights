import PropTypes from 'prop-types';
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
      batchSizeMultiplier: 2,
    };

    this.getEventNotes = this.getEventNotes.bind(this);
    this.incrementMultiplier = this.incrementMultiplier.bind(this);
    this.onClickLoadMoreNotes = this.onClickLoadMoreNotes.bind(this);
  }

  componentWillMount(props, state) {
    this.api = new Api(); 
  }

  getEventNotes(json) {
    this.setState({ eventNotes: json.notes });
  }

  incrementMultiplier() {
    let previousMultiplier = this.state.batchSizeMultiplier;
    this.setState({ batchSizeMultiplier: previousMultiplier + 1 });
  }

  onClickLoadMoreNotes() {
    const onSucceed = this.getEventNotes;
    const incrementMultiplier = this.incrementMultiplier;
  
    this.api.getEventNotesData(this.state.batchSizeMultiplier, onSucceed, incrementMultiplier);
  }

  render() {
    return(
      <NotesFeedPage
        educatorsIndex={this.state.educatorsIndex}
        eventNotes={this.state.eventNotes}
        eventNoteTypesIndex={this.state.eventNoteTypesIndex}
        onClickLoadMoreNotes={this.onClickLoadMoreNotes}
        totalNotesCount={this.props.totalNotesCount} />
    );
  }

}

PageContainer.propTypes = {
  educatorsIndex: PropTypes.object.isRequired,
  eventNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
  eventNoteTypesIndex: PropTypes.object.isRequired,
  totalNotesCount: PropTypes.number.isRequired
};

export default PageContainer;
