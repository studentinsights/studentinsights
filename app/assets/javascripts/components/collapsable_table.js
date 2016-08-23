(function() {

  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var React = window.React;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var FixedTable = window.shared.FixedTable;
  var styles = window.shared.styles;

  // Table for SlicePanels that shows a set of filters for a particular
  // dimension, and supports collapsing the list when there are no items
  // that fix particular values.
  window.shared.CollapsableTable = React.createClass({
    displayName: 'CollapsableTable',

    propTypes: {
      items: React.PropTypes.array.isRequired,
      limit: React.PropTypes.number
    },

    getDefaultProps: function() {
      return {
        minHeight: 132,
        limit: 5,
        className: ''
      };
    },

    getInitialState: function() {
      return {
        isExpanded: false
      };
    },

    onCollapseClicked: function(e) {
      this.setState({ isExpanded: false });
    },

    onExpandClicked: function(e) {
      this.setState({ isExpanded: true });
    },

    render: function() {
      var truncatedItems = (this.state.isExpanded)
        ? this.props.items
        : this.props.items.slice(0, this.props.limit);
      return dom.div({ className: 'CollapsableTable' },
        createEl(FixedTable, merge(this.props, {
          items: truncatedItems,
          children: this.renderCollapseOrExpand()
        }))
      );
    },

    renderCollapseOrExpand: function() {
      if (this.props.items.length <= this.props.limit) return;
      return dom.a({
        style: {
          fontSize: styles.fontSize,
          color: '#999',
          paddingTop: 5,
          display: 'block'
        },
        onClick: (this.state.isExpanded) ? this.onCollapseClicked : this.onExpandClicked
      }, (this.state.isExpanded) ? '- Hide details' : '+ Show all');

    }
  });
})();
