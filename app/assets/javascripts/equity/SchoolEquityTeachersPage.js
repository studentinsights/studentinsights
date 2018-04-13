import React from 'react';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import ClassroomListCreator from './ClassroomListCreator';
import ClassroomListCreatorFlipped from './ClassroomListCreatorFlipped';


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
      educators: [],
      statementText: '',
      phase: Phases.STARTING // TODO(kr)
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
      <div style={{margin: 10}}>
        <SectionHeading>Classroom communities</SectionHeading>
        <div style={{padding: 10}}>
          <div>
            <h4>Who's here?</h4>
            <textarea rows={3}></textarea>
          </div>
          <div>
            <h4>What school and grade?</h4>
            <textarea rows={1}></textarea>
          </div>
          <div>
            <h4>How many rooms?</h4>
            <textarea rows={1}></textarea>
          </div>
          <div>
            <h4>What's your plan?</h4>
            <textarea rows={6}></textarea>
          </div>
          <button className="btn" style={{float: 'right', marginRight: 40, marginTop: 10}} onClick={this.onNextClicked}>Next ></button>
        </div>
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



