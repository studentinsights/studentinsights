(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var MathDetails = window.shared.MathDetails = React.createClass({
    render: function() {
      return dom.div({}, 'yo!');
    }
  });
})();