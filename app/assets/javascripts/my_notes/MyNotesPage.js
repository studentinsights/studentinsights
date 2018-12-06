import PropTypes from 'prop-types';
import React from 'react';
import Api from './Api';
import {apiFetchJson} from '../helpers/apiFetchJson';
import NotesFeedPage from './NotesFeedPage';

export default class MyNotesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      educatorsIndex: null,
      eventNotes: null,
      totalNotesCount: null,
      batchSizeMultiplier: 2,
    };

    this.getEventNotes = this.getEventNotes.bind(this);
    this.incrementMultiplier = this.incrementMultiplier.bind(this);
    this.onClickLoadMoreNotes = this.onClickLoadMoreNotes.bind(this);
  }

  componentDidMount() {
    this.doFetchMore();
  }
  
  doFetchMore() {
    const {batchSizeMultiplier} = this.state;
    const batchSize = 30 * multiplier;    
    const url = '/educators/notes_feed_json?batch_size=' + batchSize;
    apiFetchJson(url).then(this.onDataFetched);
  }

  onDataFetched(json) {
    const previousMultiplier = this.state.batchSizeMultiplier;
    this.setState({
      eventNotes: json.notes,
      educatorsIndex: json.educators_index,
      totalNotesCount: json.total_notes_count,
      batchSizeMultiplier: previousMultiplier + 1
    });
  }

  onClickLoadMoreNotes() {
    this.doFetchMore();
  }

  render() {
    const {currentEducator} = this.props;
    return (
      <NotesFeedPage
        currentEducatorId={currentEducator.id}
        canUserAccessRestrictedNotes={currentEducator.can_view_restricted_notes}
        educatorsIndex={this.state.educatorsIndex}
        eventNotes={this.state.eventNotes}
        onClickLoadMoreNotes={this.onClickLoadMoreNotes}
        totalNotesCount={this.state.totalNotesCount} />
    );
  }

}

MyNotesPage.propTypes = {
  currentEducator: PropTypes.shape({
    id: PropTypes.number.iRequired,
    can_view_restricted_notes: PropTypes.bool.isRequired
  }).isRequired
};
