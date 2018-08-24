import PropTypes from 'prop-types';
import React from 'react';
import Api from './Api';
import NotesFeedPage from './NotesFeedPage';

class PageContainer extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      educatorsIndex: this.props.educatorsIndex,
      eventNotes: this.props.eventNotes,
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
    const {currentEducator} = this.props;
    return(
      <NotesFeedPage
        canUserAccessRestrictedNotes={currentEducator.can_view_restricted_notes}
        educatorsIndex={this.state.educatorsIndex}
        eventNotes={this.state.eventNotes}
        onClickLoadMoreNotes={this.onClickLoadMoreNotes}
        totalNotesCount={this.props.totalNotesCount} />
    );
  }

}

PageContainer.propTypes = {
  currentEducator: PropTypes.shape({
    can_view_restricted_notes: PropTypes.bool.isRequired
  }).isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  eventNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalNotesCount: PropTypes.number.isRequired
};

export default PageContainer;
