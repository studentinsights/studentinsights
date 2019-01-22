import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import SectionHeading from '../components/SectionHeading';
import StudentPhoto from '../components/StudentPhoto';
import MockStudentPhoto from '../components/MockStudentPhoto';
import DibelsBreakdownBar from '../components/DibelsBreakdownBar';
import FountasAndPinnellLevelChart from './FountasAndPinnellLevelChart';
import SidebarDialog from './SidebarDialog';
import {
  DIBELS_DORF_WPM, 
  DIBELS_DORF_ACC,
  F_AND_P_ENGLISH,
  INSTRUCTIONAL_NEEDS,
  readDoc,
  somervilleDibelsThresholdsFor
} from './readingData';


// TODO(kr) import path
import {
  reordered,
  insertedInto,
  UNPLACED_ROOM_KEY,
  initialStudentIdsByRoom
} from '../class_lists/studentIdsByRoomFunctions';


// For making and reviewing reading groups.
export default class CreateGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogForStudentId: null,
      studentIdsByRoom: initialStudentIdsByRoom(groups(props.classrooms).length, props.readingStudents)
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onStudentClicked(studentId) {
    const dialogForStudentId = (studentId === null || studentId === this.state.dialogForStudentId)
      ? null
      : studentId;
    this.setState({dialogForStudentId});
  }

  onDragEnd(dragEndResult) {
    const {studentIdsByRoom} = this.state;
    const updatedStudentIdsByRoom = studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult);
    this.setState({studentIdsByRoom: updatedStudentIdsByRoom});
  }

  render() {
    const {readingStudents, classrooms} = this.props;
    const {dialogForStudentId, studentIdsByRoom} = this.state;
    return (
      <div className="CreateGroups" style={styles.root}>
        <SectionHeading>Reading Groups: 3rd grade at Arthur D. Healey</SectionHeading>
        {dialogForStudentId && this.renderDialog(dialogForStudentId)}
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div>
            {groups(classrooms).map((group, groupIndex) => {
              const {groupKey} = group;
              const studentsInRoom = studentIdsByRoom[groupKey].map(studentId => {
                return _.find(readingStudents, { id: studentId });
              });
              return this.renderRow(group, groupIndex, studentsInRoom);
            })}
          </div>
        </DragDropContext>
      </div>
    );
  }

  renderDialog(dialogForStudentId) {
    const {readingStudents, mtssNotes, doc, grade, benchmarkPeriodKey} = this.props;
    const student = _.find(readingStudents, {id: dialogForStudentId});
    const style = {
      position: 'fixed',
      width: 250,
      right: 0,
      top: 120,
      bottom: 20,
      background: 'white',
      border: '1px solid #ccc',
      boxShadow: '2px 2px 1px #ccc',
      padding: 15,
      paddingTop: 5,
      zIndex: 1
    };
    return (
      <div style={style}>
        <SidebarDialog
          student={student}
          mtssNotesForStudent={mtssNotes.filter(note => note.student_id === student.id)}
          doc={doc}
          grade={grade}
          benchmarkPeriodKey={benchmarkPeriodKey}
          onClose={this.onStudentClicked.bind(this, null)} />
      </div>
    );
  }

  renderRow(group, groupIndex, studentsInGroup) {
    const {text, groupKey} = group;
    return (
      <div key={groupKey} style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        margin: 5
      }}>
        {this.renderGroupName(groupKey, groupIndex, text, studentsInGroup)}
        <Droppable
          droppableId={groupKey}
          direction="horizontal"
          type="GROUP">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={styles.droppable}
              {...provided.droppableProps}
            >
              {studentsInGroup.map(this.renderDraggable, this)}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  }

  renderDraggable(student, index) {
    return (
      <Draggable key={student.id} draggableId={`StudentCard:${student.id}`} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {this.renderItem(student)}
          </div>
        )}
      </Draggable>
    );
  }

  renderGroupName(groupKey, groupIndex, classroomText, studentsInGroup) {
    const {doc, grade, benchmarkPeriodKey} = this.props;
    const width = 90;
    const height = 22;
    const fnpLevels = _.sortBy(_.uniq(_.compact(studentsInGroup.map(student => {
      return readDoc(doc, student.id, F_AND_P_ENGLISH);
    }))));
    const wpms = _.sortBy(_.uniq(_.compact(studentsInGroup.map(student => {
      return readDoc(doc, student.id, DIBELS_DORF_WPM);
    }))));
    const accs = _.sortBy(_.uniq(_.compact(studentsInGroup.map(student => {
      return readDoc(doc, student.id, DIBELS_DORF_ACC);
    }))));
    const instructionalNeeds = _.sortBy(_.uniq(_.compact(studentsInGroup.map(student => {
      return readDoc(doc, student.id, INSTRUCTIONAL_NEEDS);
    }))));
    return (
      <div style={styles.row}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3em',
          background: pickGroupColor(groupIndex),
          color: 'white',
          overflow: 'hidden'
        }}>
          <div style={{transform: 'rotate(-90deg)', whiteSpace: 'nowrap'}}>{classroomText}</div>
        </div>
        <div style={{padding: 5, paddingLeft: 10, paddingRight: 10, marginRight: 5, borderRight: '1px solid #ddd'}}>
          <div style={{display: 'flex', flexDirection: 'row', height, alignItems: 'center'}}>
            <div style={{width}}>F&P: {fnpLevels.join(' ')}</div>
            <div style={{width, height}}>
              <FountasAndPinnellLevelChart
                height={height}
                levels={fnpLevels}
                isForSingleFixedGradeLevel={true}
              />
            </div>
          </div>
          <div style={{paddingTop: 10, display: 'flex', flexDirection: 'row', height, alignItems: 'center'}}>
            <div style={{width}}>ORF accuracy</div>
            <div>{renderDibelsAccuracy(grade, benchmarkPeriodKey, accs)}</div>
          </div>
          <div style={{paddingTop: 20, display: 'flex', flexDirection: 'row', height, alignItems: 'center'}}>
            <div style={{width}}>ORF fluency</div>
            <div>{renderDibelsFluency(grade, benchmarkPeriodKey, wpms)}</div>
          </div>
        </div>
        <div style={{width: '11em', padding: 5}}>
          <div style={{overflowY: 'scroll'}}>{instructionalNeeds.map(need => (
            <span key={need} style={{paddingRight: 5}}>{`“${need}”`}</span>
          ))}</div>
        </div>
      </div>
    );
  }

  renderItem(student) {
    const useMockPhoto = (this.props.useMockPhoto || window.location.search.indexOf('mock') !== -1);
    const photoProps = {
      key: student.id,
      style: styles.photoImage,
      student: student,
      fallbackEl: <span style={styles.fallbackSmiley}>😃</span>,
      alt: '😃'
    };

    return (
      <div style={styles.photoContainer} onClick={this.onStudentClicked.bind(this, student.id)}>
        {useMockPhoto
          ? <MockStudentPhoto {...photoProps} />
          : <StudentPhoto {...photoProps} />}
        <div style={{position: 'absolute', left: 2, bottom: 0, color: 'white', fontSize: 10}}>{student.first_name}</div>
      </div>
    );
  }
}
CreateGroups.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
CreateGroups.propTypes = {
  schoolName: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired,
  benchmarkPeriodKey: PropTypes.string.isRequired,
  readingStudents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired
  })).isRequired,
  classrooms: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired
  })).isRequired,
  doc: PropTypes.object.isRequired,
  mtssNotes: PropTypes.arrayOf(PropTypes.shape({
    student_id: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    recorded_at: PropTypes.string.isRequired,
  })).isRequired,
  useMockPhoto: PropTypes.bool
};

const PHOTO_MAX_WIDTH = 70;
const ROW_HEIGHT = 90;
const styles = {
  root: {
    position: 'relative'
  },
  row: {
    display: 'flex',
    fontSize: 12,
    marginBottom: 5,
    marginRight: 5,
    height: ROW_HEIGHT,
    background: '#f8f8f8',
    color: 'black',
    border: '1px solid #eee'
  },
  droppable: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#f8f8f8',
    overflowX: 'scroll'
  },
  photoContainer: {
    position: 'relative',
    width: PHOTO_MAX_WIDTH,
    height: ROW_HEIGHT,
    marginRight: 5,
    fontSize: 32
  },
  fallbackSmiley: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#333',
    opacity: 0.9
  },
  photoImage: {
    position: 'absolute',
    maxWidth: PHOTO_MAX_WIDTH,
    maxHeight: ROW_HEIGHT,
    boxShadow: '2px 2px 1px #ccc'
  }
};



// Update the `studentIdsByRoom` map after a drag ends.
export function studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult) {
  const {draggableId, source, destination} = dragEndResult;

  // Not moved
  if (destination === null) return studentIdsByRoom;

  const sourceStudentIds = studentIdsByRoom[source.droppableId];
  const destinationStudentIds = studentIdsByRoom[destination.droppableId];
  const draggableStudentId = _.find(sourceStudentIds, studentId => `StudentCard:${studentId}` === draggableId);

  // Moving within the same list
  if (source.droppableId === destination.droppableId) {
    return {
      ...studentIdsByRoom,
      [source.droppableId]: reordered(sourceStudentIds, source.index, destination.index)
    };
  }

  // Moving to another list
  if (source.droppableId !== destination.droppableId) {
    return {
      ...studentIdsByRoom,
      [source.droppableId]: _.without(sourceStudentIds, draggableStudentId),
      [destination.droppableId]: insertedInto(destinationStudentIds, destination.index, draggableStudentId)
    };
  }
}



function groups(classrooms) {
  const unplacedGroup = {
    groupKey: UNPLACED_ROOM_KEY,
    text: 'Not placed'
  };
  return [unplacedGroup].concat(classrooms.map((classroom, index) => {
    return {
      ...classroom,
      groupKey: ['room', index].join(':')
    };
  }));
}

const colors = [
  '#31AB39',
  '#EB4B26',
  '#139DEA',
  '#333333',
  '#CDD71A',
  '#6A2987',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928',
];
function pickGroupColor(groupIndex) {
  // return colors[parseInt(hash(homeroomText), 16) % colors.length];
  return colors[groupIndex];
}

function renderDibelsFluency(grade, benchmarkPeriodKey, values) {
  const dibelsCounts = computeDibelsCounts(DIBELS_DORF_WPM, grade, benchmarkPeriodKey, values);
  return renderDibelsBar(dibelsCounts);
}

function renderDibelsAccuracy(grade, benchmarkPeriodKey, values) {
  const dibelsCounts = computeDibelsCounts(DIBELS_DORF_ACC, grade, benchmarkPeriodKey, values);
  return renderDibelsBar(dibelsCounts);
}

function renderDibelsBar(props = {}) {
  const {core, strategic, intensive} = props;
  const height = 5;
  return (
    <DibelsBreakdownBar
      style={{height, width: 90}}
      height={height}
      labelTop={6}
      coreCount={core}
      strategicCount={strategic}
      intensiveCount={intensive}
    />
  );
}
renderDibelsBar.propTypes = {
  core: PropTypes.number.isRequired,
  strategic: PropTypes.number.isRequired,
  intensive: PropTypes.number.isRequired
};


// Returns {coreCount, straetgi}
function computeDibelsCounts(benchmarkAssessmentKey, grade, benchmarkPeriodKey, values) {
  const thresholds = somervilleDibelsThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  const initialCounts = {
    core: 0,
    strategic: 0,
    intensive: 0
  };
  return values.reduce((counts, value) => {
    if (value >= thresholds.benchmark) return {...counts, core: counts.core + 1};
    if (value <= thresholds.risk) return {...counts, intensive: counts.intensive + 1};
    return {...counts, strategic: counts.strategic + 1};
  }, initialCounts);
}
