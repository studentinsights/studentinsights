(function() {
  window.shared || (window.shared = {});
  const dom = window.shared.ReactHelpers.dom;
  const createEl = window.shared.ReactHelpers.createEl;
  const merge = window.shared.ReactHelpers.merge;

  const SummaryList = window.shared.SummaryList = React.createClass({
    displayName: 'SummaryList',
    render: function() {
      return (
        <div className="SummaryList" style={{ paddingBottom: 10 }}>
          <div style={{ fontWeight: 'bold' }}>
            {this.props.title}
          </div>
          <ul>
            {this.props.elements.map(function(element, index) {
              return (
                <li key={index}>
                  {element}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
  });
})();