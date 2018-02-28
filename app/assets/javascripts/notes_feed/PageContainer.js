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
        onClickLoadMoreNotes={this.onClickLoadMoreNotes} />
    );
  }

}

PageContainer.propTypes = {
  educatorsIndex: React.PropTypes.object.isRequired,
  eventNotes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  eventNoteTypesIndex: React.PropTypes.object.isRequired,
  onClickLoadMoreNotes: React.PropTypes.func.isRequired
};

export default PageContainer;
