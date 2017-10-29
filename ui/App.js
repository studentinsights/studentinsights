import React from 'react';
import {miniRouter} from './util/miniRouter';
import SchoolOverviewMain from './school_overview/SchoolOverviewMain';

// This defines the routes that the JS app knows how to render.
// [{key, route}]
const miniRoutes = [
  { key: 'school_overview', route: { path: '/schools/:slug', exact: true, strict: true } }
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
    if (routeKey === 'school_overview') return this.renderSchoolOverview(branch);
    return this.renderNotFound();
  }

  // Do nothing (since legacy JS has probably rendered something).
  renderNotFound() {
    return null;
  }

  renderSchoolOverview(branch) {
    const {routeParams} = branch;
    const {slug} = routeParams;
    return <SchoolOverviewMain schoolSlug={slug} />;
  }
}

export default App;