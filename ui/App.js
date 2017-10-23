import React from 'react';
import NotesHeatmapPage from './district/NotesHeatmapPage';
import {miniRouter} from './util/miniRouter';
import readSerializedData from './util/readSerializedData.js';

// This defines the routes that the JS app knows how to render.
// [{key, route}]
const miniRoutes = [
  { key: 'notes_heatmap', route: { path: '/district/notes_heatmap', exact: true, strict: true } },
  { key: 'restricted_notes_heatmap', route: { path: '/district/restricted_notes_heatmap', exact: true, strict: true } }
];


// This is the top-level component, only handling routing now.
// The core model is still "new page, new load," this just
// handles routing on initial page load for JS code.
class App extends React.Component {
  render() {
    const branch = miniRouter(window.location, miniRoutes);
    const routeKey = (branch) ? branch.routeKey : null;
    return this.renderRoute(routeKey, branch);
  }

  renderRoute(routeKey, branch) {
    if (routeKey === 'notes_heatmap') return this.renderNotesHeatmap(branch);
    if (routeKey === 'restricted_notes_heatmap') return this.renderNotesHeatmap(branch);
    return this.renderNotFound();
  }

  // Do nothing (since legacy JS has probably rendered something).
  renderNotFound() {
    return null;
  }

  renderNotesHeatmap(branch) {
    const {notes} = readSerializedData();
    return <NotesHeatmapPage  heatmapNotes={notes} />;
  }
}

export default App;