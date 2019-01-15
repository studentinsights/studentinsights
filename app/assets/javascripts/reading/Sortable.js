import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {SortDirection} from 'react-virtualized';


export default class Sortable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'name',
      sortDirection: SortDirection.ASC
    };

    this.ordered = this.ordered.bind(this);
    this.onTableSort = this.onTableSort.bind(this);
  }

  ordered(items, sortFnsMap) {
    const {sortBy, sortDirection} = this.state;

    // map dataKey to an accessor/sort function
    const sortFn = sortFnsMap[sortBy] || _.identity;
    const sortedRows = _.sortBy(items, sortFn);

    // respect direction
    return (sortDirection == SortDirection.DESC) 
      ? sortedRows.reverse()
      : sortedRows;
  }

  onTableSort({defaultSortDirection, event, sortBy, sortDirection}) {
    if (sortBy === this.state.sortBy) {
      const oppositeSortDirection = (this.state.sortDirection == SortDirection.DESC)
        ? SortDirection.ASC
        : SortDirection.DESC;
      this.setState({ sortDirection: oppositeSortDirection });
    } else {
      this.setState({sortBy});
    }
  }

  render() {
    const {sortDirection, sortBy} = this.state;
    const {children} = this.props;
    return children({
      sortDirection,
      sortBy,
      ordered: this.ordered,
      onTableSort: this.onTableSort
    });
  }
}
Sortable.propTypes = {
  children: PropTypes.func.isRequired
};
