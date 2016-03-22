(function() {

  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var colors = window.shared.colors;
  var styles = window.shared.styles;

  /*
  A fixed-size table of items for SlicePanel, describing a set of
  values for a dimension that the user can filter by.
  Items are shown in the order they are passed, and there is
  no user interation to change the list of items.
  */
  var FixedTable = window.shared.FixedTable = React.createClass({
    displayName: 'FixedTable',

    onRowClicked: function(item, e) {
      this.props.onFilterToggled(item.filter);
    },

    render: function() {
      return this.renderTableFor(this.props.title, this.props.items, this.props);
    },

    // title height is fixed since font-weight causes loading a font which delays initial render
    renderTableFor: function(title, items, options) {
      options || (options = {});
      var className = options.className || '';
      var selectedFilterIdentifiers = _.pluck(this.props.filters, 'identifier');
      return dom.div({
        className: 'FixedTable panel ' + className,
        style: {
          display: 'inline-block',
          paddingTop: 5,
          paddingBottom: 5
        }
      },
        dom.div({ className: 'fixed-table-title', style: { marginBottom: 5, paddingLeft: 5, fontWeight: 'bold', height: '1em' }}, title),
        dom.table({},
          dom.tbody({}, items.map(function(item) {
            var key = item.caption;
            var isFilterApplied = _.contains(selectedFilterIdentifiers, item.filter.identifier);
            return dom.tr({
              className: 'clickable-row',
              key: item.caption,
              style: {
                backgroundColor: (isFilterApplied) ? colors.selection: null,
                cursor: 'pointer'
              },
              onClick: this.onRowClicked.bind(this, item)
            },
              dom.td({
                className: 'caption-cell',
                style: { opacity: (item.percentage === 0) ? 0.15 : 1 }
              },
                dom.a({
                  style: { fontSize: styles.fontSize, paddingLeft: 10 }
                }, item.caption)
              ),
              dom.td({ style: { fontSize: styles.fontSize, width: 48, textAlign: 'right', paddingRight: 8 }},
                (item.percentage ===  0) ? '' : Math.ceil(100 * item.percentage) + '%'),
              dom.td({ style: { fontSize: styles.fontSize, width: 50 } }, this.renderBar(item.percentage, 50))
            );
          }, this))
        ),
        dom.div({ style: { paddingLeft: 5 } }, this.props.children)
      );
    },

    renderBar: function(percentage, width) {
      return dom.div({
        className: 'bar',
        style: {
          width: Math.round(width*percentage) + '%',
          height: '1em',
        }
      });
    }
  });

  // table that supports collapsing
  var CollapsableTable = React.createClass({
    displayName: 'CollapsableTable',
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
