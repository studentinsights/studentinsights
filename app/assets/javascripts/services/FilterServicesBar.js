import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {allGrades} from '../helpers/gradeText';
import EscapeListener from '../components/EscapeListener';
import FilterBar from '../components/FilterBar';
import SelectGrade from '../components/SelectGrade';
import SelectServiceType from '../components/SelectServiceType';
import SelectSchool from '../components/SelectSchool';
import SimpleFilterSelect from '../components/SimpleFilterSelect';
import {ALL} from '../components/SimpleFilterSelect';
import {rankedByGradeLevel} from '../helpers/SortHelpers';


// Takes a list of services and filters them.
export default class FilterServicesBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onEscape = this.onEscape.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onSchoolIdChanged = this.onSchoolIdChanged.bind(this);
    this.onServiceTypeIdChanged = this.onServiceTypeIdChanged.bind(this);
    this.onProviderTextChanged = this.onProviderTextChanged.bind(this);
  }

  filteredServices() {
    const {services} = this.props;
    const {searchText, grade, schoolId, serviceTypeId, providerText} = this.state;

    return services.filter(service => {
      if (shouldFilterOut(grade, service.student.grade)) return false;
      if (shouldFilterOut(schoolId, service.student.school.id)) return false;
      if (shouldFilterOut(serviceTypeId, service.service_type.id)) return false;
      if (shouldFilterOut(providerText, service.provided_by_educator_name)) return false;
      if (!searchTextMatches(searchText, service)) return false;
      return true;
    });
  }

  onEscape() {
    this.setState(initialState());
  }

  onSearchChanged(e) {
    this.setState({searchText: e.target.value});
  }

  onGradeChanged(grade) {
    this.setState({grade});
  }

  onSchoolIdChanged(schoolId) {
    this.setState({schoolId});
  }

  onServiceTypeIdChanged(serviceTypeId) {
    this.setState({serviceTypeId});
  }

  onProviderTextChanged(providerText) {
    this.setState({providerText});
  }

  render() {
    const {children, style, barStyle} = this.props;
    const filteredServices = this.filteredServices();

    return (
      <EscapeListener className="FilterServicesBar" style={style} onEscape={this.onEscape}>
        <FilterBar style={barStyle}>
          {this.renderSearch(filteredServices)}
          {this.renderGradeSelect()}
          {this.renderSchoolSelect()}
          {this.renderServiceTypeSelect()}
          {this.renderProviderSelect()}
        </FilterBar>
        {children(filteredServices)}
      </EscapeListener>
    );
  }

  renderSearch(filteredStudents) {
    const {searchText} = this.state;
    return (
      <input
        style={styles.search}
        ref={el => this.searchInputEl = el}
        placeholder={`Search ${filteredStudents.length} supports...`}
        value={searchText}
        onChange={this.onSearchChanged} />
    );
  }

  renderGradeSelect() {
    const {grade} = this.state;
    const sortedGrades = _.sortBy(allGrades(), rankedByGradeLevel);
    return (
      <SelectGrade
        grade={grade}
        grades={sortedGrades}
        onChange={this.onGradeChanged} />
    );
  }

  renderSchoolSelect() {
    const {services} = this.props;
    const {schoolId} = this.state;
    const uniqueSchools = _.uniqBy(_.compact(services.map(service => service.student.school)), 'id');
    const schools = uniqueSchools.map(school => {
      return {
        id: school.id,
        label: school.name
      };
    });
    return (
      <SelectSchool
        style={styles.select}
        schoolId={schoolId}
        schools={schools}
        onChange={this.onSchoolIdChanged} />
    );
  }

  renderServiceTypeSelect() {
    const {services} = this.props;
    const {serviceTypeId} = this.state;
    const uniqueServiceTypes = _.uniqBy(_.compact(services.map(service => service.service_type)), 'id');
    return (
      <SelectServiceType
        style={styles.select}
        serviceTypeId={serviceTypeId}
        serviceTypes={uniqueServiceTypes}
        onChange={this.onServiceTypeIdChanged} />
    );
  }

  renderProviderSelect() {
    const {services} = this.props;
    const {providerText} = this.state;
    const sortedProviders = _.sortBy(_.uniq(_.compact(services.map(service => service.provided_by_educator_name))));
    const options = sortedProviders.map(provider => {
      return {value: provider, label: provider};
    });

    return (
      <SimpleFilterSelect
        style={styles.select}
        placeholder="Provider..."
        value={providerText}
        onChange={this.onProviderTextChanged}
        options={options} />
    );
  }
}
FilterServicesBar.propTypes = {
  services: PropTypes.array.isRequired,
  children: PropTypes.func.isRequired,
  style: PropTypes.object,
  barStyle: PropTypes.object
};

const styles = {
  select: {
    width: '10em',
    marginRight: 10
  },

  // Matching react-select
  search: {
    display: 'inline-block',
    padding: '7px 7px 7px 12px',
    borderRadius: 4,
    border: '1px solid #ccc',
    marginLeft: 20,
    marginRight: 10,
    fontSize: 14,
    width: 220
  },
};


function initialState() {
  return {
    searchText: '',
    grade: ALL,
    school: ALL,
    serviceTypeId: ALL,
    schoolId: ALL,
    providerText: ALL
  };
}

function shouldFilterOut(selectedValue, studentValue) {
  if (selectedValue === ALL) return false; // no filter
  return (studentValue !== selectedValue);
}

function searchTextMatches(searchText, service) {
  if (searchText === '') return true;
  const tokens = searchText.toLowerCase().split(' ');
  const {student} = service;
  const flatText = _.compact([
    student.first_name,
    student.last_name,
    student.grade,
    student.school.name,
    service.service_type.name,
    service.provided_by_educator_name
  ]).join(' ').toLowerCase();
  return _.every(tokens, token => flatText.indexOf(token) !== -1);
}
