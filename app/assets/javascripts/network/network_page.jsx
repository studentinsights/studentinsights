import Viva from 'vivagraphjs';



function textForNode(node) {
  if (node.data.type === 'student') return (node.data.student.first_name.slice(0, 1) + node.data.student.last_name.slice(0, 1)).toUpperCase();
  if (node.data.type === 'educator') return node.data.educator.full_name;
  if (node.data.type === 'external') return node.data.external.full_name;
  return '';
}
function classNameForNode(node) {
  if (node.data.type === 'student') return 'NetworkPage-node-label-student';
  if (node.data.type === 'educator') return 'NetworkPage-node-label-educator';
  if (node.data.type === 'external') return 'NetworkPage-node-label-external';
  return 'NetworkPage-node-label-generic';
}
function generateDOMLabels(graph, container) {
  // this will map node id into DOM element
  var labels = Object.create(null);
  graph.forEachNode(function(node) {
    // Filter orphan nodes
    if (node.links.length === 0) return;

    var label = document.createElement('span');
    label.classList.add(classNameForNode(node));
    label.classList.add('NetworkPage-node-label');
    label.innerText = textForNode(node);
    labels[node.id] = label;
    container.appendChild(label);
  });
  // NOTE: If your graph changes over time you will need to
  // monitor graph changes and update DOM elements accordingly
  return labels;
}

function createLabelGraphics(graph, container) {
  const domLabels = generateDOMLabels(graph, container);
  const graphics = Viva.Graph.View.webglGraphics();
  
  // This callback is called by the renderer before it updates
  // node coordinate. We can use it to update corresponding DOM
  // label position;
  graphics.placeNode((ui, pos) => {
    // we create a copy of layout position
    // And ask graphics to transform it to DOM coordinates:
    const domPos = {
      x: pos.x,
      y: pos.y
    };
    graphics.transformGraphToClientCoordinates(domPos);

    // then move corresponding dom label to its own position:
    const nodeId = ui.node.id;
    const domLabel = domLabels[nodeId];
    if (domLabel) {
      const labelStyle = domLabel.style;
      const width = (ui.node.data.type === 'student')
        ? domLabel.offsetWidth
        : 0;
      labelStyle.left = (domPos.x - width/2) + 'px';
      labelStyle.top = (domPos.y - width/2) + 'px';
    }
  });

  return graphics;
}


function addMouseEvents(graph, graphics, renderNode) {
  Viva.Graph.webglInputEvents(graphics, graph)
    .mouseEnter(node => renderNode(node))
    .mouseLeave(node => renderNode(null))
    .dblClick(node => openNode(node))
}

function openNode(node) {
  const url = nodeUrl(node);
  if (!url) return;
  window.open(url, '_blank');
}

function nodeUrl(node) {
  const baseUrl = 'https://somerville.studentinsights.org';
  if (node.data.type === 'student') {
    return baseUrl + '/students/' + node.data.student.id;
  }
  if (node.data.type === 'educator') {
    return baseUrl + '/homerooms/' + node.data.educator.homeroom_id;
  }

  return null;
}

function renderNode(el, node) {
  if (!node) {
    el.style.display = 'none';
    return;
  }


  console.log(node.data);
  if (node.data.type === 'student') {
    const {student} = node.data;
    el.innerHTML = '<a href="' + nodeUrl(node) + '">' + student.first_name + ' ' + student.last_name + '</a>';
  }

  if (node.data.type === 'educator') {
    const {educator} = node.data;
    el.innerHTML = '<div>' +
      '<div>' + educator.full_name + '</div>' +
      (educator.homeroom_id
          ? '<a href="' + nodeUrl(node) + '">Homeroom</a>'
          : '') +
    '</div>';
  }

  if (node.data.type === 'external') {
    const {external} = node.data;
    el.innerHTML = external.full_name;
  }

  el.style.display = 'block';
  el.innerHTML = '<div>' +
    '<div>' + el.innerHTML + '</div>' +
    '<div style="margin-top: 10px; color: #ccc">' + node.data.type + '</div>' +
    '<div style="color: #ccc">' + node.id + '</div>' +
  '</div>';
}

function allLinkedIds(links) {
  var linkedIds = [];
  links.forEach(({left, right}) => {
    linkedIds.push(left);
    linkedIds.push(right);
  });
  return _.uniq(linkedIds);
}

// Draws a network visualization of a graph.
export default React.createClass({
  propTypes: {
    links: React.PropTypes.array.isRequired,
    style: React.PropTypes.object
  },

  componentDidMount: function() {
    // Create graph
    const {nodes, links} = this.props;
    const graph = Viva.Graph.graph();
    const linkedIds = allLinkedIds(links);
    links.forEach(({left, right}) => graph.addLink(left, right));
    nodes
      .filter(({id}) => linkedIds.indexOf(id) !== -1)
      .forEach(({id, data}) => graph.addNode(id, data));

    // Define graphics
    const container = this.el;
    const graphics = createLabelGraphics(graph, container);
    // const graphics = Viva.Graph.View.webglGraphics();

    // Layout
    const layout = Viva.Graph.Layout.forceDirected(graph, {
      springLength : 10,
      springCoeff : 0.0001,
      dragCoeff : 0.04,
      gravity : -0.15
    });

    // Events
    const statusEl = this.statusEl;
    addMouseEvents(graph, graphics, (node) => renderNode(statusEl, node));
    renderNode(statusEl, null);

    // Render!
    const renderer = Viva.Graph.View.renderer(graph, {
      graphics,
      layout,
      container
    });
    renderer.run();

    this.graph = graph;
    this.graphics = graphics;
    this.renderer = renderer;
  },

  render: function() {
    const {style} = this.props;
    return (
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div ref={el => this.statusEl = el} style={{
          border: '1px solid #fbca70',
          overflow: 'hidden',
          position: 'absolute',
          background: 'rgb(255, 240, 212)',
          padding: 20,
          textAlign: 'center',
          minWidth: 250,
          top: 20,
          right: 20,
          zIndex: 20
        }} />
        <div ref={el => this.el = el} style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }} />
      </div>
    );
  }
});