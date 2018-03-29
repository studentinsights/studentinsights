import React from 'react';
import FixedTable from './FixedTable';
import {styles} from '../helpers/Theme';

// Table for SlicePanels that shows a set of filters for a particular
// dimension, and supports collapsing the list when there are no items
// that fix particular values.
class CollapsableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false
    };
    this.onCollapseClicked = this.onCollapseClicked.bind(this);
    this.onExpandClicked = this.onExpandClicked.bind(this);
  }

  onCollapseClicked(e) {
    this.setState({ isExpanded: false });
  }

  onExpandClicked(e) {
    this.setState({ isExpanded: true });
  }

  render() {
    const truncatedItems = (this.state.isExpanded)
      ? this.props.items
      : this.props.items.slice(0, this.props.limit);
    const props = {
      ...this.props,
      items: truncatedItems,
      children: this.renderCollapseOrExpand()
    };
    return (
      <div className="CollapsableTable">
        <FixedTable {...props} />
      </div>
    );
  }

  renderCollapseOrExpand() {
    if (this.props.items.length <= this.props.limit) return;
    return (
      <a
        style={{
          fontSize: styles.fontSize,
          color: '#999',
          paddingTop: 5,
          display: 'block'
        }}
        onClick={(this.state.isExpanded) ? this.onCollapseClicked : this.onExpandClicked}>
        {(this.state.isExpanded) ? '- Hide details' : '+ Show all'}
      </a>
    );

  }
}
CollapsableTable.propTypes = {
  title: React.PropTypes.string.isRequired,
  items: React.PropTypes.array.isRequired,
  filters: React.PropTypes.array.isRequired,
  onFilterToggled: React.PropTypes.func.isRequired,
  limit: React.PropTypes.number
};

CollapsableTable.defaultProps = {
  minHeight: 132,
  limit: 5,
  className: ''
};

export default CollapsableTable;