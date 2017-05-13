import NetworkPage from './network_page.jsx';
import _ from 'lodash';


$(function() {
  function hashCode(string) {
    var hash = 0, i, chr;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
      chr   = string.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  if ($('body').hasClass('schools') && $('body').hasClass('network')) {
    const MixpanelUtils = window.shared.MixpanelUtils;

    const serializedData = $('#serialized-data').data();
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', {
      page_key: 'NETWORK_PAGE',
      school_id: serializedData.school.id
    });

    const grade = window.location.search.slice(1) || '8';
    console.log(serializedData);
    const students = serializedData.tables.students
      .filter(s => s.school_id === 2)
      .filter(s => s.grade === grade)
      .filter(s => s.enrollment_status === 'Active');
    const educators = serializedData.tables.educators
      .filter(e => e.school_id === 2)
      .filter(e => e.full_name);

    var nodes = [];
    students.forEach((student) => {
      nodes.push({
        id: student.node_id,
        data: {type: 'student', student}
      });
    });
    educators.forEach((educator) => {
      nodes.push({
        id: educator.node_id,
        data: {type: 'educator', educator}
      });
    });
    serializedData.tables.external_people.forEach((external) => {
      nodes.push({
        id: external.node_id,
        data: {type: 'external', external}
      });
    });

    const nodeIds = nodes.map(node => node.id);
    var links = [];
    serializedData.pairs.forEach((pair) => {
      if (nodeIds.indexOf(pair.right_id) === -1) return null;
      if (nodeIds.indexOf(pair.left_id) === -1) return null;
      links.push({
        left: pair.left_id,
        right: pair.right_id
      });
    });

    console.log({nodes, links});
    window.nodes = nodes;
    window.links = links;
    window.ReactDOM.render(<NetworkPage
      key={hashCode(JSON.stringify({nodes, links}))}
      nodes={nodes}
      links={links}
    />, document.getElementById('main'));
  }
});
