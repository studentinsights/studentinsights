import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import FeedView from '../feed/FeedView';
import {highlightStyleForKey, userFacingValueForKey} from './highlights';
import {equityChecks, equityCheckFlags} from './ClassroomStats';
import CleanSlateMessage, {defaultSchoolYearsBack, filteredFeedCardsForCleanSlate} from '../student_profile/CleanSlateMessage';


// Inline student profile for classroom list creator, shown as a modal
export default class InlineStudentProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isViewingAllNotes: false
    };

    this.onToggleCaseHistory = this.onToggleCaseHistory.bind(this);
  }

  onToggleCaseHistory(e) {
    const {isViewingAllNotes} = this.state;
    this.setState({isViewingAllNotes: !isViewingAllNotes});
  }

  render() {
    const {student} = this.props;
    return (
      <div className="InlineStudentProfile" style={styles.root}>
        <h4 style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
            <StudentPhotoCropped studentId={student.id} />
            <a style={{fontSize: 24, fontWeight: 'bold'}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>
          </div>
          <a style={{fontSize: 12}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">Open full profile</a>
        </h4>
        <div style={styles.columns}>
          {this.renderSimpleColumn()}
          <div style={{...styles.column, marginTop: 20}}>
            {this.renderFeed()}
          </div>
        </div>
      </div>
    );
  }

  renderSimpleColumn() {
    const {gradeLevelNextYear} = this.props;

    const flags = equityCheckFlags(gradeLevelNextYear);
    return (
      <div style={{...styles.column, marginTop: 10, fontSize: 12}}>
        <SectionHeading>Equity checks</SectionHeading>
        <div style={{display: 'flex', flexDirection: 'row', marginLeft: 10, marginRight: 10}}>
          {_.compact(equityChecks(flags)).map(category => this.renderHeaderCell(category))}
        </div>
      </div>
    );
  }

  renderHeaderCell(params) {
    const {student} = this.props;
    const {label, columnHighlightKey, title} = params;
    const highlightStyle = highlightStyleForKey(student, columnHighlightKey);
    return (
      <div key={label} style={styles.equityCheck}>
        <div style={styles.equityCheckLabel} title={title}>{label}</div>
        <div style={{...styles.equityCheckValue, ...highlightStyle}}>
          {userFacingValueForKey(student, columnHighlightKey)}
        </div>
      </div>
    );
  }

  renderFeed() {
    const {student, fetchProfile} = this.props;
    return (
      <div style={styles.feed}>
        <SectionHeading>Notes for {student.first_name}</SectionHeading>
        <GenericLoader
          promiseFn={() => fetchProfile(student.id)}
          render={this.renderFeedWithData.bind(this)} />
      </div>
    );
  }

  renderFeedWithData(json) {
    const {nowFn} = this.context;
    const {isViewingAllNotes} = this.state;
    const schoolYearsBack = defaultSchoolYearsBack;
    const cleanSlateFeedCards = filteredFeedCardsForCleanSlate(json.feed_cards, schoolYearsBack.number, nowFn);
    return (
      <div style={{maxWidth: 500}}>
        <FeedView feedCards={cleanSlateFeedCards} />
        <CleanSlateMessage
          canViewFullHistory={true}
          isViewingFullHistory={isViewingAllNotes}
          onToggleVisibility={this.onToggleCaseHistory}
          xAmountOfDataText={`${schoolYearsBack.textYears} of data`}
      />
      </div>
    );
  }
}
InlineStudentProfile.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
InlineStudentProfile.propTypes = {
  fetchProfile: PropTypes.func.isRequired,
  student: PropTypes.object.isRequired,
  gradeLevelNextYear: PropTypes.string.isRequired
};

const styles = {
  root: {
    margin: 20,
    fontSize: 14
  },
  columns: {
  },
  column: {
  },
  equityCheck: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  equityCheckLabel: {
    padding: 5,
    paddingBottom: 0,
    minHeight: '2em'
  },
  equityCheckValue: {
    minHeight: '5em',
    margin: 5,
    padding: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  feed: {
    paddingTop: 20
  }
};