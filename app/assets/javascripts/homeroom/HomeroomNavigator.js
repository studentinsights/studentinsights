import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import * as Routes from '../helpers/Routes';
import {ORDERED_GRADES} from '../helpers/gradeText';
import Button from '../components/Button';


// For typing a homeroom name and jumping to it, or dropping down a list and clicking.
// Requires clicking "Go" to navigate.
export default class HomeroomNavigator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homeroomOption: null
    };
    this.onHomeroomItemChanged = this.onHomeroomItemChanged.bind(this);
    this.onNavigate = this.onNavigate.bind(this);
  }

  onHomeroomItemChanged(homeroomOption) {
    this.setState({homeroomOption});
  }

  onNavigate() {
    const {homeroomOption} = this.state;
    const id = homeroomOption.value;
    window.location = Routes.homeroom(id);
  }

  render() {
    const {homerooms, style} = this.props;
    const {homeroomOption} = this.state;

    const sortedHomerooms = _.sortBy(homerooms, homeroom => {
      const gradesSortKey = (homeroom.grades.length === 1)
        ? ORDERED_GRADES[homeroom.grades[0]]
        : ORDERED_GRADES.length + 1;
      return [gradesSortKey, homeroom.name];
    });
    const options = sortedHomerooms.map(homeroom => {
      return {
        value: homeroom.id,
        label: `${homeroom.name} (${homeroomGradesText(homeroom)})`
      };
    });

    return (
      <div className="HomeroomNavigator" style={{...styles.root, ...style}}>
        <Select
          placeholder="Find homeroom..."
          value={homeroomOption}
          style={styles.select}
          onChange={this.onHomeroomItemChanged}
          options={options}
        />
        <Button
          isDisabled={homeroomOption === null}
          onClick={this.onNavigate}
        >Go</Button>
      </div>
    );
  }
}
HomeroomNavigator.propTypes = {
  homerooms: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    grades: PropTypes.arrayOf(PropTypes.string).isRequired
  })).isRequired,
  style: PropTypes.object
};


const styles = {
  root: {
    display: 'flex',
    flexDirection: 'row'
  },
  select: {
    width: '15em',
    marginRight: 10
  }
};


function homeroomGradesText(homeroom) {
  return (homeroom.grades.length === 1) ? homeroom.grades[0] : 'mixed';
}