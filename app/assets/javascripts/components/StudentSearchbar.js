import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Autocomplete from 'react-autocomplete';
import MixpanelUtils from '../helpers/MixpanelUtils';
import {apiFetchJson} from '../helpers/apiFetchJson';
import * as colors from '../helpers/colors';


export default class StudentSearchbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      students: [],
      text: ''
    };

    this.fetchStudentsJson = this.fetchStudentsJson.bind(this);
    this.fetchStudentsJsonFromServer = this.fetchStudentsJsonFromServer.bind(this);
    this.onStudentSelected = this.onStudentSelected.bind(this);
    this.renderMenuContent = this.renderMenuContent.bind(this);
  }

  componentDidMount() {
    this.fetchStudentsJson().then(students => this.setState({students}));
  }

  fetchStudentsJson() {
    // If no sessionStorage, always have to fetch
    if (!(window.sessionStorage)) return this.fetchStudentsJsonFromServer();

    // If sessionStorage is empty, fetch
    const namesCache = window.sessionStorage.student_names_cache;
    if (!namesCache) return this.fetchStudentsJsonFromServer();

    // Read from cache
    return Promise.resolve(JSON.parse(namesCache));
  }

  // Fetch and also update the sessionStorage cache
  fetchStudentsJsonFromServer() {
    return apiFetchJson('/students/names').then(json => {
      window.sessionStorage.student_names_cache = JSON.stringify(json);
    });
  }

  onStudentSelected(studentId) {
    if (this.props.onStudentSelected) return this.props.onStudentSelected();

    MixpanelUtils.track('SEARCHBAR_SELECTED_STUDENT', {});
    window.location.pathname = `/students/${studentId}`;
  }

  render() {
    const {students, text} = this.state;
    const {autocompleteProps, inputStyles} = this.props;
    
    return (
      <Autocomplete
        className="StudentSearchbar-autocomplete"
        value={text}
        items={students}
        getItemValue={item => item.label}
        autoHighlight={true}
        shouldItemRender={matchStateToTerm}
        onChange={(event, text) => this.setState({text})}
        onSelect={(text, item) => this.onStudentSelected(item.id)}
        renderInput={props => <input style={{...styles.input, ...inputStyles}} placeholder="Find student..." {...props} />}
        menuStyle={styles.menu}
        renderItem={(item, isHighlighted) => (
          <div style={{
            ...styles.itemStyle,
            background: isHighlighted ? colors.selection : 'white'
          }}>{item.label}</div>
        )}
        {...(autocompleteProps || {})}
      />
    );
  }

  renderMenuContent(items, text) {
    const {students} = this.state;
    if (text === '') return <div className="item">Type a student's name...</div>;
    if (students.length === 0) return <div className="item">Loading...</div>;
    if (items.length === 0) return <div className="item">No matches for {text}</div>;

    return items; 
  }
}
StudentSearchbar.propTypes = {
  autocompleteProps: PropTypes.object,
  inputStyles: PropTypes.object,
  onStudentSelected: PropTypes.object // eg, for testing
};

const styles = {
  menu: {
    borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%',
    zIndex: 1 // this is the only change from the default
  },
  input: {
    fontSize: 14,
    padding: '3px 5px',
    marginTop: 1,
    border: '1px solid #ccc',
    borderRadius: 3
  },
  itemStyle: {
    padding: 5,
    cursor: 'pointer'
  }
};

function matchStateToTerm(student, text) {
  const tokens = text.split(' ').map(token => token.toLowerCase());
  return _.every(tokens, token => student.label.toLowerCase().indexOf(token) !== -1);
}

export function clearStorage() {
  if (window.sessionStorage && window.sessionStorage.clear) {
    window.sessionStorage.clear();
  }
}
