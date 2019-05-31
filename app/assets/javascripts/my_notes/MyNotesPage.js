import React from 'react';
import {apiFetchJson} from '../helpers/apiFetchJson';
import Loading from '../components/Loading';
import NotesFeed from './NotesFeed';


export default class MyNotesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      batchSizeMultiplier: 2,
      hasFetched: false,
      currentEducator: null,
      mixedEventNotes: null,
      totalNotesCount: null
    };

    this.doFetchMore = this.doFetchMore.bind(this);
    this.onClickLoadMoreNotes = this.onClickLoadMoreNotes.bind(this);
    this.onDataFetched = this.onDataFetched.bind(this);
  }

  componentDidMount() {
    this.doFetchMore();
  }
  
  doFetchMore() {
    const {batchSizeMultiplier} = this.state;
    const batchSize = 30 * batchSizeMultiplier;    
    const url = '/api/educators/my_notes_json?batch_size=' + batchSize;
    apiFetchJson(url).then(this.onDataFetched);
  }

  onDataFetched(json) {
    const {batchSizeMultiplier} = this.state;
    this.setState({
      hasFetched: true,
      currentEducator: json.current_educator, // fetched for can_view_restricted_notes
      mixedEventNotes: json.mixed_event_notes,
      totalNotesCount: json.total_notes_count,
      batchSizeMultiplier: batchSizeMultiplier + 1
    });
  }

  onClickLoadMoreNotes() {
    this.doFetchMore();
  }

  render() {
    const {
      hasFetched,
      currentEducator,
      mixedEventNotes,
      totalNotesCount
    } = this.state;
    if (!hasFetched) return <Loading style={{padding: 10}} />;
    
    return (
      <NotesFeed
        canUserAccessRestrictedNotes={currentEducator.can_view_restricted_notes}
        totalNotesCount={totalNotesCount}
        mixedEventNotes={mixedEventNotes}
        onClickLoadMoreNotes={this.onClickLoadMoreNotes}
      />
    );
  }
}
