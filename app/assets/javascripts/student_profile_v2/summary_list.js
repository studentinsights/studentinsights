(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SummaryList = window.shared.SummaryList = React.createClass({
    displayName: 'SummaryList',
    render: function() {
      return dom.div({ className: 'SummaryList', style: { paddingBottom: 10 } },
        dom.div({ style: { fontWeight: 'bold' } }, this.props.title),
        dom.ul({}, this.props.elements.map(function(element, index) {
          return dom.li({ key: index }, element);
        }))
      );
    }
  });
})();