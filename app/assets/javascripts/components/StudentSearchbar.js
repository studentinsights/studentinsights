import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Autocomplete from 'react-autocomplete';
import * as Routes from '../helpers/Routes';
import memoizer from '../helpers/memoizer';
import {apiFetchJson} from '../helpers/apiFetchJson';
import * as colors from '../helpers/colors';

// Optimized for feeling responsive with large lists.
export default class StudentSearchbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      students: [],
      text: props.initialText || ''
    };

    this.fetchStudentsJson = this.fetchStudentsJson.bind(this);
    this.fetchStudentsJsonFromServer = this.fetchStudentsJsonFromServer.bind(this);
    this.onStudentSelected = this.onStudentSelected.bind(this);
    this.renderMenuContent = this.renderMenuContent.bind(this);

    this.memoize = memoizer();
  }

  componentDidMount() {
    this.fetchStudentsJson()
      .then(students => this.setState({students}))
      .catch(err => reportToRollbar('StudentSearchbar#catch', err));
  }

  fetchStudentsJson() {
    const {sessionStorage, cacheKey} = this.props;
    // If no sessionStorage, always have to fetch
    if (!sessionStorage) return this.fetchStudentsJsonFromServer();

    // If sessionStorage is empty, fetch
    const namesCache = sessionStorage.getItem(cacheKey);
    if (!namesCache) return this.fetchStudentsJsonFromServer();

    // Read from cache
    return Promise.resolve(JSON.parse(namesCache));
  }

  // Fetch and also update the sessionStorage cache
  fetchStudentsJsonFromServer() {
    const {sessionStorage, cacheKey} = this.props;
    const url = '/api/educators/student_searchbar_json';
    return apiFetchJson(url).then(json => {
      sessionStorage.setItem(cacheKey, JSON.stringify(json));
      return json;
    });
  }

  // Performance optimizations for districtwide users in particular.
  // This can be more than 10k items, and rendering them all is
  // expensive and not useful.  This caches 
  filteredAndTruncated() {
    return this.memoize(['filteredAndTruncated', this.state, this.props], () => {
      const {matchesLimit} = this.props;
      const {students, text} = this.state;

      // don't popup all students
      if (text === '') {
        return {
          studentsForList: [],
          studentsForListById: {},
          countOverLimit: 0
        };
      }

      // Filtering for search, limiting max results since it's too
      // expensive to render 6000 matches (eg, after typing one
      // character).
      const tokens = text.split(' ').map(token => token.toLowerCase());
      const studentsForList = [];
      var countOverLimit = 0; // eslint-disable-line no-var
      students.forEach(student => {
        if (studentsForList.length >= matchesLimit) {
          countOverLimit = countOverLimit + 1;
          return;
        }
        if (matchStateToTerm(student, tokens)) {
          studentsForList.push(student);
        }
      });
      const studentsForListById = studentsForList.reduce((map, student) => {
        return {...map, [student.id]: true};
      }, {});

      return {
        studentsForList,
        studentsForListById,
        countOverLimit: countOverLimit
      };
    });
  }

  onStudentSelected(studentId) {
    if (this.props.onStudentSelected) return this.props.onStudentSelected();
    const studentProfileUrl = Routes.studentProfile(studentId);
    window.location.pathname = studentProfileUrl;
  }

  render() {
    const {text} = this.state;
    const {autocompleteProps, inputStyles} = this.props;
    
    // Optimization, since <Autocomplete /> doesn't support limiting
    // the number of suggestions and we need to do that for large lists.
    const {studentsForList, studentsForListById, countOverLimit} = this.filteredAndTruncated();
    const maybeMoreItemsEl = (countOverLimit === 0) ? null : (
      <div key="more-items" style={styles.more}>
        <span>+ {countOverLimit} more {countOverLimit === 1 ? 'student' : 'students'}</span>
        <a style={{marginLeft: 10}} href="/educators/my_students">view all</a>
      </div>
    );
    return (
      <Autocomplete
        value={text}
        items={studentsForList}
        getItemValue={item => item.label}
        autoHighlight={true}
        onChange={(event, text) => this.setState({text})}
        onSelect={(text, item) => this.onStudentSelected(item.id)}
        renderInput={props => <input style={{...styles.input, ...inputStyles}} placeholder="Find student..." {...props} />}
        shouldItemRender={(item, value) => studentsForListById[item.id]}
        renderItem={(item, isHighlighted) => (
          <div key={item.id} style={{
            ...styles.itemStyle,
            background: isHighlighted ? colors.selection : 'white'
          }}>{item.label}</div>
        )}
        renderMenu={function(items, value, style) {
          // This uses `function` since it relies on
          // `this` being set by Autocomplete call.
          //
          // Appends a "+ n more" message if the results are
          // truncated (only common for districtwide users with
          // short search texts like 1-2 characters).
          return (
            <div
              style={{
                ...this.menuStyle, // defaults
                ...style, // positioning
                ...styles.menu // our styling
              }}
              children={items.concat(maybeMoreItemsEl)}
            />
          );
        }}
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
  initialText: PropTypes.string,
  autocompleteProps: PropTypes.object,
  inputStyles: PropTypes.object,
  matchesLimit: PropTypes.number,
  cacheKey: PropTypes.string,
  // eg, for testing
  sessionStorage: PropTypes.shape({
    getItem: PropTypes.func.isRequired,
    setItem: PropTypes.func.isRequired
  }),
  onStudentSelected: PropTypes.func
};
StudentSearchbar.defaultProps = {

  matchesLimit: 500,
  cacheKey: 'studentInsights.studentSearchbar.studentNamesCacheKey',
  sessionStorage: window.sessionStorage
};

const styles = {
  menu: {
    position: 'absolute', // changed from the default
    zIndex: 1 // changed from the default
  },
  input: {
    fontSize: 14,
    width: '100%',
    padding: '3px 5px',
    marginTop: 1,
    border: '1px solid #ccc',
    borderRadius: 3
  },
  itemStyle: {
    padding: 5,
    cursor: 'pointer'
  },
  more: {
    color: '#999',
    padding: 5,
    paddingTop: 15,
    paddingBottom: 10,
    background: 'white'
  }
};

function matchStateToTerm(student, tokens) {
  return _.every(tokens, token => student.label.toLowerCase().indexOf(token) !== -1);
}

function reportToRollbar(msg, err) {
  if (window.Rollbar && window.Rollbar.error) {
    window.Rollbar.error(msg, err);
  } else {
    console.error('Could not report to Rollbar', msg, err); // eslint-disable-line no-console
  }
}

export function clearStorage() {
  if (window.sessionStorage && window.sessionStorage.clear) {
    window.sessionStorage.clear();
  }
}
