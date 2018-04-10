import React from 'react';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import ClassroomListCreator from './ClassroomListCreator';


const Phases = {
  STARTING: 'starting',
  CREATING: 'creating',
  REVIEWING: 'reviewing'
};

// For grade-level teaching teams 
export default class SchoolEquityTeachersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      educatorIds: [],
      statementText: '',
      phase: Phases.STARTING
    };

    this.onNextClicked = this.onNextClicked.bind(this);
  }

  onNextClicked() {
    this.setState({ phase: Phases.CREATING });
  }

  render() {
    const {phase} = this.state;
    return (
      <div className="SchoolEquityTeachersPage">
        <ExperimentalBanner />
        {phase === Phases.STARTING && this.renderStartingPhase()}
        {phase === Phases.CREATING && this.renderCreatingPhase()}
      </div>
    );
  }

  renderStartingPhase() {
    return (
      <div>
        <div>
          <SectionHeading>Who's here?</SectionHeading>
          <textarea rows={6}></textarea>
        </div>
        <div>
          <SectionHeading>What school and grade?</SectionHeading>
          <textarea rows={6}></textarea>
        </div>
        <div>
          <SectionHeading>What's your plan?</SectionHeading>
          <textarea rows={6}></textarea>
        </div>
        <button onClick={this.onNextClicked}>ok</button>
      </div>
    );
  }

  renderCreatingPhase() {
    const {schoolId, grade} = this.props;
    const {educators} = this.state;
    return (
      <ClassroomListCreator
        schoolId={schoolId}
        grade={grade}
        educators={educators} />
    );
  }
}
SchoolEquityTeachersPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired,
  grade: React.PropTypes.string.isRequired
};



