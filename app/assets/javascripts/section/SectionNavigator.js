import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import * as Routes from '../helpers/Routes';
import Button from '../components/Button';


// For typing a section name and jumping to it, or dropping down a list and clicking.
// Requires clicking "Go" to navigate.
export default class SectionNavigator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionOption: null
    };
    this.onSectionItemChanged = this.onSectionItemChanged.bind(this);
    this.onNavigate = this.onNavigate.bind(this);
  }

  onSectionItemChanged(sectionOption) {
    this.setState({sectionOption});
  }

  onNavigate() {
    const {sectionOption} = this.state;
    const id = sectionOption.value;
    window.location = Routes.section(id);
  }

  render() {
    const {sections, style} = this.props;
    const {sectionOption} = this.state;

    const sortedSections = _.sortBy(sections, section => {
      return [
        section.course_description,
        section.section_number,
        sortKeyForTerm(section.term_local_id)
      ];
    });
      
    const options = sortedSections.map(section => {
      return {
        value: section.id,
        label: `${section.course_description} (${section.section_number})`
      };
    });

    return (
      <div className="SectionNavigator" style={{...styles.root, ...style}}>
        <Select
          placeholder="Find section..."
          value={sectionOption}
          style={styles.select}
          onChange={this.onSectionItemChanged}
          options={options}
        />
        <Button
          isDisabled={sectionOption === null}
          onClick={this.onNavigate}
        >Go</Button>
      </div>
    );
  }
}
SectionNavigator.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    course_description: PropTypes.string.isRequired,
    section_number: PropTypes.string.isRequired,
    term_local_id: PropTypes.string,
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


const ORDERED_TERMS = [
  '9', 'FY',  // all year
  '1', 'S1', 'Q1', 'Q2', // first semester or first two quarters
  '2', 'S2', 'Q3', 'Q4' // second semester of last two quarters
];

function sortKeyForTerm(term) {
  const index = ORDERED_TERMS.indexOf(term);
  return (index === -1) ? Number.MAX_VALUE : index;
}