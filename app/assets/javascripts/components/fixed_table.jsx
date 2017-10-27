import _ from 'lodash';
import './fixed_table.scss';

(function() {

  window.shared || (window.shared = {});
  const React = window.React;
  const colors = window.shared.colors;
  const styles = window.shared.styles;

  /*
  A fixed-size table of items for SlicePanel, describing a set of
  values for a dimension that the user can filter by.
  Items are shown in the order they are passed, and there is
  no user interation to change the list of items.
  */
  window.shared.FixedTable = React.createClass({
    displayName: 'FixedTable',

    propTypes: {
      onFilterToggled: React.PropTypes.func.isRequired,
      filters: React.PropTypes.array.isRequired,
      title: React.PropTypes.string.isRequired,
      items: React.PropTypes.array.isRequired,
      children: React.PropTypes.element,
    },

    onRowClicked: function(item, e) {
      this.props.onFilterToggled(item.filter);
    },

    render: function() {
      return this.renderTableFor(this.props.title, this.props.items, this.props);
    },

    // title height is fixed since font-weight causes loading a font which delays initial render
    renderTableFor: function(title, items, options) {
      options || (options = {});
      const className = options.className || '';
      const selectedFilterIdentifiers = _.map(this.props.filters, 'identifier');
      return (
        <div
          className={'FixedTable panel ' + className}
          style={{
            display: 'inline-block',
            paddingTop: 5,
            paddingBottom: 5
          }}>
          <div
            className="fixed-table-title"
            style={{ marginBottom: 5, paddingLeft: 5, fontWeight: 'bold', height: '1em' }}>
            {title}
          </div>
          <table>
            <tbody>
              {items.map(function(item) {
                const isFilterApplied = _.contains(selectedFilterIdentifiers, item.filter.identifier);
                return (
                  <tr
                    className="clickable-row"
                    key={item.caption}
                    style={{
                      backgroundColor: (isFilterApplied) ? colors.selection: null,
                      cursor: 'pointer'
                    }}
                    onClick={this.onRowClicked.bind(this, item)}>
                    <td
                      className="caption-cell"
                      style={{ opacity: (item.percentage === 0) ? 0.15 : 1 }}>
                      <a style={{ fontSize: styles.fontSize, paddingLeft: 10 }}>
                        {item.caption}
                      </a>
                    </td>
                    <td
                      style={{ fontSize: styles.fontSize, width: 48, textAlign: 'right', paddingRight: 8 }}>
                      {this.renderPercentage(item.percentage)}
                    </td>
                    <td style={{ fontSize: styles.fontSize, width: 50 }}>
                      {this.renderBar(item.percentage, 50)}
                    </td>
                  </tr>
                );
              }, this)}
            </tbody>
          </table>
          <div style={{ paddingLeft: 5 }}>
            {this.props.children}
          </div>
        </div>
      );
    },

    renderPercentage: function (percentage) {
      if (percentage === 0) {
        return '';
      } else if (percentage < 0.01) {
        return '< 1%';
      } else {
        return Math.round(100 * percentage) + '%';
      }
    },

    renderBar: function(percentage, width) {
      return (
        <div
          className="bar"
          style={{
            width: Math.round(width*percentage) + '%',
            height: '1em',
          }} />
      );
    }
  });
})();
