import React from 'react';
import GenericLoader from '../components/GenericLoader';
import ExperimentalBanner from '../components/ExperimentalBanner';
import {apiFetchJson} from '../helpers/apiFetchJson';
import NotesHeatmap from './NotesHeatmap';


// See what's going on with notes across a district over time.
export default class DistrictNotesPage extends React.Component {
  constructor(props) {
    super(props);

    this.fetchNotesData = this.fetchNotesData.bind(this);
    this.renderNotes = this.renderNotes.bind(this);
  }

  fetchNotesData() {
    const url = `/api/district/notes_heatmap_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="DistrictNotePage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchNotesData}
          render={this.renderNotes} />
      </div>
    );
  }

  renderNotes(json) {
    const {notes, schools} = json;
    
    return <NotesHeatmap heatmapNotes={notes} schools={schools} />;
  }
}