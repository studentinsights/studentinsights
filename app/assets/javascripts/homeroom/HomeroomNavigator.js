import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import * as Routes from '../helpers/Routes';
import Button from '../components/Button';


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
    const slug = homeroomOption.value;
    window.location = Routes.homeroom(slug);
  }

  render() {
    const {homerooms, style} = this.props;
    const {homeroomOption} = this.state;

    return (
      <div className="HomeroomNavigator" style={{...styles.root, ...style}}>
        <Select
          placeholder="Jump to homeroom..."
          value={homeroomOption}
          style={styles.select}
          onChange={this.onHomeroomItemChanged}
          options={_.sortBy(homerooms, 'name').map(homeroom => {
            return {
              value: homeroom.slug,
              label: homeroom.name
            };
          })}
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
  homerooms: PropTypes.array.isRequired,
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
