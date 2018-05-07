import React from 'react';
import _ from 'lodash';
import {gradeText} from '../helpers/gradeText';
import Loading from '../components/Loading';
import CreateYourLists from './CreateYourLists';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import HorizontalStepper from './HorizontalStepper';
import {fetchProfile} from './api';


const text = `Over the last few years, I’ve been hearing from teachers and principals about how complex and time-consuming the class assignment process is.  It’s so hard to juggle and keep track of all the various factors, like gender, ELL status, disabilities, academics, and discipline.  And in a diverse city as ours, we want as much as possible for the classrooms at each grade level to reflect the diversity of your school community.    In the past year, people who have seen our Student Insights system have asked if there might be a way to use technology to make the process a little more streamlined.

With our new grant from the Boston Foundation to expand the functionality of Insights, we are happy to announce that we have created a tool for you to use.   Over the past few months, we have talked to a bunch of teachers and principals to see what would help, prototyped different models, and piloted this tool with several teams to get feedback.

-Uri`;


// This is the UI component for grade-level teaching teams to go through the process
// of creating classroom lists.  It tracks all changes and passes them up to callbacks,
// and hands off to other UI components that handle stepping through the process
// and screens for each step.
export default class ClassListCreatorWorkflow extends React.Component {
  constructor(props) {
    super(props);

    this.renderStepContents = this.renderStepContents.bind(this);
  }

  render() {
    const {steps, stepIndex, availableSteps, onStepChanged, isEditable} = this.props;

    return (
      <div className="ClassListCreatorView" style={styles.root}>
        <HorizontalStepper
          steps={steps}
          availableSteps={availableSteps}
          stepIndex={stepIndex}
          onStepChanged={onStepChanged}
          renderFn={this.renderStepContents}
          style={styles.horizontalStepper}
          contentStyle={styles.horizontalStepperContent} />
        {!isEditable && <div>readonly</div>}
      </div>
    );
  }

  renderStepContents(stepIndex, step) {
    if (stepIndex === 0) return this.renderChooseYourGrade();
    if (stepIndex === 1) return this.renderMakeAPlan();
    if (stepIndex === 2) return this.renderCreateYourClassrooms();
    if (stepIndex === 3) return this.renderReviewAndShareNotes();
    if (stepIndex === 4) return this.renderShareWithPrincipal();
  }

  renderChooseYourGrade() {
    const {
      schools,
      gradeLevelsNextYear,
      schoolId,
      gradeLevelNextYear,
      onSchoolIdChanged,
      onGradeLevelNextYearChanged
    } = this.props;
    const videoUrl = null;

    if (schools === null || gradeLevelsNextYear === null) return <Loading />;
    return (
      <div style={styles.stepContent}>
        <div>
          <div style={styles.heading}>Why are we doing this?</div>
          <div style={{fontSize: 12, padding: 10, paddingLeft: 5, whiteSpace: 'pre-wrap'}}>
            {text}
          </div>
          {videoUrl && <a href={videoUrl} target="_blank" style={styles.videoLink}>Watch the full video</a>}
        </div>
        <div>
          <div>
            <div style={styles.heading}>What school?</div>
              <Select
                name="select-school-name"
                value={schoolId}
                onChange={item => onSchoolIdChanged(item.value)}
                options={_.sortBy(schools, s => s.name).map(school => {
                  return {
                    value: school.id,
                    label: school.name
                  };
                })}
              />
          </div>
          <div>
            <div style={styles.heading}>What grade level are you creating?</div>
              <Select
                name="select-grade-level"
                value={gradeLevelNextYear}
                onChange={item => onGradeLevelNextYearChanged(item.value)}
                options={gradeLevelsNextYear.map(gradeLevelNextYear => {
                  return {
                    value: gradeLevelNextYear,
                    label: `Next year's ${gradeText(gradeLevelNextYear)} ` 
                  };
                })}
              />
          </div>
        </div>
      </div>
    );
  }

  renderMakeAPlan() {
    const {
      educators,
      authors,
      students,
      gradeLevelNextYear,
      classroomsCount,
      planText,
      onEducatorsChanged,
      onClassroomsCountIncremented,
      onPlanTextChanged
    } = this.props;

    if (educators === null || students === null) return <Loading />;
    return (
      <div style={styles.stepContent}>
        <div>
          <div style={styles.heading}>Who's the team creating these class lists?</div>
          <Select
            name="select-educators"
            value={authors.map(educator => educator.id)}
            multi
            removeSelected
            onChange={onEducatorsChanged}
            options={authors.map(educator => {
              return {
                value: educator.id,
                label: educator.full_name
              };
            })}
          />
        </div>
        <div>
          <div style={styles.heading}>How many {gradeText(gradeLevelNextYear)} classrooms will you create?</div>
          <div style={{marginLeft: 5, display: 'inline-block'}}>
            <button
              style={styles.incrementButton}
              disabled={classroomsCount < 2}
              onClick={() => onClassroomsCountIncremented(-1)}>
              -
            </button>
            <div style={{display: 'inline-block', padding: 10}}>{classroomsCount} classrooms</div>
            <button
              style={styles.incrementButton}
              disabled={classroomsCount >= 5}
              onClick={() => onClassroomsCountIncremented(1)}>
              +
            </button>
          </div>
          <div style={{display: 'inline-block', fontSize: 12, marginLeft: 20}}>With {students.length} students total, this makes the <b>average class size {Math.ceil(students.length / classroomsCount)} students</b>.</div>
        </div>
        <div>
          <div style={styles.heading}>What's your plan for creating classroom communitites?</div>
          <div style={{fontSize: 12, padding: 10, paddingLeft: 0, paddingTop: 3}}>
            Some teams start with considering social dynamics, splitting up students who are leaders or who don't work well together.  Others start creating groups with diverse academic strengths.
          </div>
          <textarea
            style={styles.textarea}
            rows={12}
            value={planText}
            onChange={event => onPlanTextChanged(event.target.value)} />
        </div>
      </div>
    );
  }

  renderCreateYourClassrooms() {    
    const {
      workspaceId,
      students,
      classroomsCount,
      onClassListsChanged,
      studentIdsByRoom,
      gradeLevelNextYear
    } = this.props;

    if (students === null || studentIdsByRoom === null) return <Loading />;
    return (
      <CreateYourLists
        students={students}
        classroomsCount={classroomsCount}
        gradeLevelNextYear={gradeLevelNextYear}
        studentIdsByRoom={studentIdsByRoom}
        fetchProfile={studentId => fetchProfile(workspaceId, studentId)}
        onClassListsChanged={onClassListsChanged}/>
    );
  }

  renderReviewAndShareNotes() {
    const {onPrincipalNoteChanged, principalNoteText} = this.props;
    return (
      <div style={styles.stepContent}>
        <div>What else should your principal know?</div>
        <div style={{paddingTop: 5, paddingLeft: 0, padding: 10, fontSize: 12}}>
          Putting in these notes will help your principal and other team members understand all the different factors that you considered besides what shows up in the graphs.  This is also crucial information for a principal to know in case they need to move any students around over the summer.
        </div>
        <textarea
          value={principalNoteText}
          onChange={event => onPrincipalNoteChanged(event.target.value)}
          rows={12} 
          style={styles.textarea} />
      </div>
    );
  }

  renderShareWithPrincipal() {
    return (
      <div style={styles.stepContent}>
        <div>Ready to submit?</div>
      </div>
    );
  }
}
ClassListCreatorWorkflow.propTypes = {
  // server data
  schools: React.PropTypes.array,
  gradeLevelsNextYear: React.PropTypes.array,
  students: React.PropTypes.array,
  educators: React.PropTypes.array,

  // config
  steps: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  availableSteps: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  isEditable: React.PropTypes.bool.isRequired,

  // state
  stepIndex: React.PropTypes.number.isRequired,
  workspaceId: React.PropTypes.string.isRequired,
  schoolId: React.PropTypes.number,
  gradeLevelNextYear: React.PropTypes.string,
  authors: React.PropTypes.array.isRequired,
  classroomsCount: React.PropTypes.number.isRequired,
  planText: React.PropTypes.string.isRequired,
  studentIdsByRoom: React.PropTypes.object,
  principalNoteText: React.PropTypes.string.isRequired,

  // callbacks
  onStepChanged: React.PropTypes.func.isRequired,
  onSchoolIdChanged: React.PropTypes.func.isRequired,
  onGradeLevelNextYearChanged: React.PropTypes.func.isRequired,
  onEducatorsChanged: React.PropTypes.func.isRequired,
  onClassroomsCountIncremented: React.PropTypes.func.isRequired,
  onPlanTextChanged: React.PropTypes.func.isRequired,
  onClassListsChanged: React.PropTypes.func.isRequired,
  onPrincipalNoteChanged: React.PropTypes.func.isRequired
};

const styles = {
  root: {},
  heading: {
    marginTop: 20
  },
  button: {
    display: 'inline-block',
    margin: 5,
    cursor: 'pointer'
  },
  incrementButton: {
    display: 'inline-block',
    padding: 1,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16
  },
  stepContent: {
    margin: 20
  },
  videoLink: {
    display: 'inline-block',
    marginLeft: 5,
    fontSize: 12
  },
  horizontalStepper: {
    paddingTop: 15
  },
  horizontalStepperContent: {
    borderTop: '1px solid #ccc',
    marginTop: 10
  },
  textarea: {
    border: '1px solid #ccc',
    width: '100%'
  }
};


