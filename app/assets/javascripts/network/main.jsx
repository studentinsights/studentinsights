import NetworkPage from './network_page.jsx';
import _ from 'lodash';

// Transform into ngraph format
function computeNetwork(network, filters) {
  // Apply filters
  const {grade, schoolId} = filters;
  const students = network.students
    .filter(s => s.school_id === schoolId)
    .filter(s => !grade || s.grade === grade)
    .filter(s => s.enrollment_status === 'Active');
  const educators = network.educators
    .filter(e => e.school_id === schoolId)
    .filter(e => e.full_name);

  // Build nodes
  const {externals} = network;
  console.log({students, educators});
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
  externals.forEach((external) => {
    nodes.push({
      id: external.node_id,
      data: {type: 'external', external}
    });
  });

  // Build links
  const {pairs} = network;
  const nodeIds = nodes.map(node => node.id);
  var links = [];
  pairs.forEach((pair) => {
    if (nodeIds.indexOf(pair.right_id) === -1) return null;
    if (nodeIds.indexOf(pair.left_id) === -1) return null;
    links.push({
      left: pair.left_id,
      right: pair.right_id
    });
  });

  return {nodes, links};
}

// signed integer
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


$(function() {
  if ($('body').hasClass('schools') && $('body').hasClass('network')) {
    const MixpanelUtils = window.shared.MixpanelUtils;

    const serializedData = $('#serialized-data').data();
    const {currentEducator, school, network} = serializedData;
    MixpanelUtils.registerUser(currentEducator);
    MixpanelUtils.track('PAGE_VISIT', {
      page_key: 'NETWORK_PAGE',
      school_id: school.id
    });

    console.log('wat');
    // Read grade filter to explore
    const grade = window.location.search.slice(1) || null;
    const {nodes, links} = computeNetwork(network, {
      grade,
      schoolId: school.id
    });
    console.log({nodes, links, network, school, grade});
    window.ReactDOM.render(<NetworkPage
      nodes={nodes}
      links={links}
    />, document.getElementById('main'));
  }
});
