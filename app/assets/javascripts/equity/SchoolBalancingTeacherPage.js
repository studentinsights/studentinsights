import React from 'react';
import _ from 'lodash';
import qs from 'query-string';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import Card from '../components/Card';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {sortByGrade} from '../helpers/SortHelpers';
import {gradeText} from '../helpers/gradeText';
import ClassroomListCreator from './ClassroomListCreator';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import HorizontalStepper from './HorizontalStepper';
import uuidv4 from 'uuid/v4';


const Phases = {
  STARTING: 'starting',
  CREATING: 'creating',
  REVIEWING: 'reviewing'
};




const text = `Over the last few years, I’ve been hearing from teachers and principals about how complex and time-consuming the class assignment process is.  It’s so hard to juggle and keep track of all the various factors, like gender, ELL status, disabilities, academics, and discipline.  And in a diverse city as ours, we want as much as possible for the classrooms at each grade level to reflect the diversity of your school community.    In the past year, people who have seen our Student Insights system have asked if there might be a way to use technology to make the process a little more streamlined.

With our new grant from the Boston Foundation to expand the functionality of Insights, we are happy to announce that we have created a tool for you to use.   Over the past few months, we have talked to a bunch of teachers and principals to see what would help, prototyped different models, and piloted this tool with several teams to get feedback.

-Uri`;


// For grade-level teaching teams 
export default class SchoolBalancingTeacherPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      balanceId: props.balanceId || uuidv4(),
      educators: [],
      statementText: '',
      schoolId: null,
      gradeLevelNextYear: null,
      classroomsCount: 2,
      phase: Phases.STARTING // TODO(kr)
    };

    this.fetchGradeLevels = this.fetchGradeLevels.bind(this);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.onNextClicked = this.onNextClicked.bind(this);
    this.onSchoolIdChanged = this.onSchoolIdChanged.bind(this);
    this.onGradeLevelNextYearChanged = this.onGradeLevelNextYearChanged.bind(this);
    this.onEducatorsChanged = this.onEducatorsChanged.bind(this);
    this.renderStepContents = this.renderStepContents.bind(this);
    this.renderChooseYourGradeWithData = this.renderChooseYourGradeWithData.bind(this);
    this.renderMakeAPlanWithData = this.renderMakeAPlanWithData.bind(this);
  }

  componentDidMount() {
    // schedule warn or navigate away
    window.addEventListener('beforeunload', this.onBeforeUnload);

    // TODO(kr) schedule save every 30 seconds to `balanceId`

    // rewrite URL with balanceId
    const {balanceId} = this.state;
    const path = `/balancing/${balanceId}`;
    window.history.replaceState({}, null, path);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload');
  }

  fetchGradeLevels() {
    const {balanceId} = this.state;
    const url = `/api/balancing/${balanceId}/available_grade_levels_json`;
    return apiFetchJson(url);
  }

  fetchStudents() {
    const {balanceId, gradeLevelNextYear, schoolId} = this.state;
    const params = {
      grade_level_next_year: gradeLevelNextYear,
      school_id: schoolId
    };
    const url = `/api/balancing/${balanceId}/students_for_grade_level_next_year_json?${qs.stringify(params)}`;
    return apiFetchJson(url);
  }

  // TODO(kr) check this on IE
  onBeforeUnload(event) {
    const isDirty = true;
    return (isDirty)
      ? 'You have unsaved changes.'
      : undefined;
  }

  onNextClicked() {
    this.setState({ phase: Phases.CREATING });
  }

  onSchoolIdChanged(item) {
    this.setState({schoolId: item.value});
  }

  onGradeLevelNextYearChanged(item) {
    this.setState({gradeLevelNextYear: item.value});
  }

  onEducatorsChanged(educators) {
    console.log(educators);
    this.setState({educators}); 
  }

  render() {
    return (
      <div className="SchoolBalancingTeacherPage" style={{margin: 10}}>
        <SectionHeading>Classroom communities</SectionHeading>
        <HorizontalStepper
          style={{padding: 10, paddingTop: 20}}
          defaultStepIndex={0}
          steps={[
            'Choose your grade',
            'Make a plan',
            'Create your classrooms',
            'Review and share notes',
            'Share with your principal'
          ]}
          renderFn={this.renderStepContents} />
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
    return (
      <GenericLoader
        key="grade"
        promiseFn={this.fetchGradeLevels}
        render={this.renderChooseYourGradeWithData} />
    );
  }

  renderChooseYourGradeWithData(json) {
    const {schoolId, gradeLevelNextYear} = this.state;
    const gradeLevelsNextYear = json.grade_levels_next_year.sort(sortByGrade);
    const {schools} = json;
    const videoUrl = 'https://www.youtube.com/watch?v=6hw3o6RzHek&t=2s';

    return (
      <div style={styles.stepContent}>
        <div>
          <div style={styles.heading}>Why are we doing this?</div>
          <div style={{fontSize: 12, padding: 10, paddingLeft: 5, whiteSpace: 'pre-wrap'}}>
            {text}
          </div>
          <a href={videoUrl} target="_blank" style={styles.videoLink}>Watch the full video</a>
        </div>
        <div>
          <div>
            <div style={styles.heading}>What school?</div>
              <Select
                name="select-school-name"
                value={schoolId}
                onChange={this.onSchoolIdChanged}
                options={schools.map(school => {
                  return {
                    value: school.id,
                    label: school.name
                  };
                })}
              />
          </div>
          <div>
            <div style={styles.heading}>What grade level?</div>
              <Select
                name="select-grade-level"
                value={gradeLevelNextYear}
                onChange={this.onGradeLevelNextYearChanged}
                options={gradeLevelsNextYear.map(gradeLevelNextYear => {
                  return {
                    value: gradeLevelNextYear,
                    label: `${gradeText(gradeLevelNextYear)} next year` 
                  };
                })}
              />
          </div>
        </div>
      </div>
    );
  }

  renderMakeAPlan() {
    return (
      <GenericLoader
        key="plan"
        promiseFn={this.fetchStudents}
        render={this.renderMakeAPlanWithData} />
    );
  }

  renderMakeAPlanWithData(json) {
    const {educators, classroomsCount} = this.state;
    const {students} = json;
    // TODO(kr) want to setState here for current educator
    const educatorNames = json.educator_names;

    return (
      <div style={styles.stepContent}>
        <div>
          <div style={styles.heading}>Who's on the teaching team?</div>
          <Select
            name="select-educators"
            value={educators}
            /* default should include current educator */
            multi
            removeSelected
            onChange={this.onEducatorsChanged}
            options={educatorNames.map(educatorName => {
              return {
                value: educatorName,
                label: educatorName
              };
            })}
          />
        </div>
        <div>
          <div style={styles.heading}>How many classrooms will you create?</div>
          <div>
            <Card style={{display: 'inline-block'}}>-</Card>
            {_.range(0, classroomsCount).map(classroomIndex => {
              return this.renderClassroomCountButton(classroomIndex);
            })}
            <Card style={{display: 'inline-block'}}>+</Card>
          </div>
          <div style={{fontSize: 12}}>With {students.length} students total, the average class size would be <b>{Math.ceil(students.length / classroomsCount)} students</b>.</div>
        </div>
        <div>
          <div style={styles.heading}>What's your plan for creating classroom communitites?</div>
          <textarea style={{border: '1px solid #ccc', width: '100%'}}  rows={8}></textarea>
        </div>
      </div>
    );
  }

  renderClassroomCountButton(number) {
    const colors = [
      '#e41a1c',
      // '#377eb8',
      '#4daf4a',
      '#984ea3',
      '#ff7f00',
      '#ffff33'
    ];
    const color = colors[number];
    return (
      <Card key={number} style={{...styles.button, backgroundColor: color, opacity: 0.8}}>Classroom {number + 1}</Card>
    );
  }

  renderCreateYourClassrooms() {    
    const {educators, schoolId, gradeLevelNextYear, classroomsCount} = this.state;
    return (
      <ClassroomListCreator
        schoolId={schoolId}
        gradeLevelNextYear={gradeLevelNextYear}
        classroomsCount={classroomsCount}
        educators={educators} />
    );
  }

  renderReviewAndShareNotes() {
    return (
      <div style={styles.stepContent}>
        <div>What notes do you want to share?</div>
        <textarea style={{border: '1px solid #eee'}} rows={6}></textarea>
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
SchoolBalancingTeacherPage.propTypes = {
  balanceId: React.PropTypes.string
};

const styles = {
  heading: {
    marginTop: 20
  },
  button: {
    display: 'inline-block',
    margin: 5,
    cursor: 'pointer'
  },
  stepContent: {
    margin: 10
  },
  videoLink: {
    display: 'inline-block',
    marginLeft: 5,
    fontSize: 12
  }
};


