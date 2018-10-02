import React from 'react';
import PropTypes from 'prop-types';
import Button from '../components/Button';
import StudentLevelsTable from './StudentLevelsTable';


// Focused lists of students who meet triggered but aren't yet being mentioned in support meetings.
export default class SupportGaps extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowingList: false
    };
    this.onLinkClicked = this.onLinkClicked.bind(this);
  }

  onLinkClicked(e) {
    e.preventDefault();
    const {isShowingList} = this.state;
    this.setState({isShowingList: !isShowingList});
  }

  render() {
    const {message, systemsAndSupports} = this.props;
    const {isShowingList} = this.state;
    return (
      <div className="SupportGaps" style={styles.root}>
        <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
          <div>{message}</div>
          <div>{systemsAndSupports}</div>
          {!isShowingList && <Button style={{marginTop: 20}} onClick={this.onLinkClicked}>show students</Button>}
        </div>
        {this.renderStudentsList()}
      </div>
    );
  }

  renderStudentsList(key) {
    const {isShowingList} = this.state;
    if (!isShowingList) return null;

    const {uncoveredStudentsWithTiering} = this.props;
    return (
      <div style={styles.table}>
        <StudentLevelsTable studentsWithTiering={uncoveredStudentsWithTiering} />
      </div>
    );
  }
}
SupportGaps.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
SupportGaps.propTypes = {
  message: PropTypes.node.isRequired,
  systemsAndSupports: PropTypes.node.isRequired,
  uncoveredStudentsWithTiering: PropTypes.array.isRequired
};

const strengthColor = '#4d884d';
const styles = {
  root: {
    fontSize: 14,
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  table: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  bar: {
    backgroundColor: strengthColor,
    borderLeft: '1px solid #aaa',
    color: 'white'
  },
  person: {
    fontSize: 14,
    display: 'block'
  }
};
