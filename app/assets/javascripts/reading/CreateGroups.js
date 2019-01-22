import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import hash from 'object-hash';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import SectionHeading from '../components/SectionHeading';
import StudentPhoto from '../components/StudentPhoto';
import MockStudentPhoto from '../components/MockStudentPhoto';
import FountasAndPinnellLevelChart from './FountasAndPinnellLevelChart';


// TODO(kr) import path
import {
  reordered,
  insertedInto,
  UNPLACED_ROOM_KEY,
  initialStudentIdsByRoom,
  consistentlyPlacedInitialStudentIdsByRoom
} from '../class_lists/studentIdsByRoomFunctions';
import {
  DIBELS_DORF_WPM, 
  DIBELS_DORF_ACC,
  F_AND_P_ENGLISH,
  INSTRUCTIONAL_NEEDS,
  readDoc
} from './readingData';



// For making and reviewing reading groups.
export default class CreateGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      studentIdsByRoom: initialStudentIdsByRoom(groups(props.classrooms).length, props.readingStudents)
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  withMerged(students) {
    const {mtssNotes} = this.props;
    // const dibelsByStudentId = _.groupBy(dibelsDataPoints, 'student_id');
    const mtssByStudentId = _.groupBy(mtssNotes, 'student_id');
    return students.map(student => {
      return {
        ...student,
        // dibels: dibelsByStudentId[student.id] || [],
        mtss: mtssByStudentId[student.id] || []
      };
    });
  }


  onDragEnd(dragEndResult) {
    const {studentIdsByRoom} = this.state;
    const updatedStudentIdsByRoom = studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult);
    this.setState({studentIdsByRoom: updatedStudentIdsByRoom});
  }

  // onDragEnd(dragEndResult) {
  //   // // dropped outside the list
  //   if (!result.destination) {
  //     return;
  //   }

  //   this.setState(
  //     reorderQuoteMap({
  //       quoteMap: this.state.quoteMap,
  //       source: result.source,
  //       destination: result.destination,
  //     }),
  //   );
  // }

  render() {
    const {readingStudents, classrooms} = this.props;
    const {studentIdsByRoom} = this.state;
    const students = this.withMerged(readingStudents);
    return (
      <div>
        <SectionHeading>Reading Groups: 3rd grade at Arthur D. Healey</SectionHeading>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div>
            {groups(classrooms).map((group, groupIndex) => {
              const {groupKey} = group;
              const studentsInRoom = studentIdsByRoom[groupKey].map(studentId => {
                return _.find(students, { id: studentId });
              });
              return this.renderRow(group, groupIndex, studentsInRoom);
            })}
          </div>
        </DragDropContext>
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

  /* 
  return this.renderClickableStudentCard(student, {
  //   ref: provided.innerRef,
  //   placeholder: provided.placeholder,
  //   propsFromDraggable: {
  //     ...provided.draggableProps,
  //     ...provided.dragHandleProps
  //   }
  // });
  */

  // // Optionally pass arguments to make this work as a Draggable
  // renderItem(student, options = {}) {
  //   const {ref, placeholder, propsFromDraggable = {}} = options;
  //   return (
  //     <div className="renderClickableStudentCard">
  //       <div ref={ref} {...propsFromDraggable}>
  //         {this.renderActual(student)}
  //       </div>
  //       {placeholder /* this preserves space when dragging */}
  //     </div>
  //   );
  // }


  renderGroupName(groupKey, groupIndex, classroomText, studentsInGroup) {
    const {doc} = this.props;
    const width = 100;
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
        <div style={{padding: 5, paddingLeft: 10, marginRight: 5, borderRight: '1px solid #ddd'}}>
          <div style={{display: 'flex', flexDirection: 'row', height, alignItems: 'center'}}>
            <div style={{width}}>F&P: {fnpLevels.join(' ')}</div>
            <div style={{width, height}}>
              <FountasAndPinnellLevelChart height={height} levels={fnpLevels} />
            </div>
          </div>
          <div style={{paddingTop: 10, display: 'flex', flexDirection: 'row', height, alignItems: 'center'}}>
            <div style={{width}}>DORF accuracy:</div>
            <div>{range(accs)}</div>
          </div>
          <div style={{paddingTop: 10, display: 'flex', flexDirection: 'row', height, alignItems: 'center'}}>
            <div style={{width}}>DORF words/min:</div>
            <div>{range(wpms)}</div>
          </div>
        </div>
        <div style={{width: '11em', padding: 5}}>
          <div style={{overflowY: 'scroll'}}>{instructionalNeeds.map(need => (
            <span style={{paddingRight: 5}}>{`“${need}”`}</span>
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
      <div style={styles.photoContainer}>
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

const ROW_HEIGHT = 80;
const styles = {
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
    width: 64,
    height: ROW_HEIGHT,
    marginRight: 1,
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
    maxWidth: 64,
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



// // relies on already sorted
// function tryLatest(key, list) {
//   const obj = _.first(list);
//   return obj ? obj[key] : null;
// }

// function latestDibels(student) {
//   return tryLatest('benchmark', student.dibels_results);
// }
// function latestFAndP(student) {
//   return tryLatest('instructional_level', student.f_and_p_assessments);
// }
// function latestStar(student) {
//   return tryLatest('percentile_rank', student.star_reading_results);
// }

// function tryDibels(dibels, grade, assessmentPeriod, assessmentKey) {
//   const d = _.find(dibels, {
//     grade,
//     assessment_period: assessmentPeriod,
//     assessment_key: assessmentKey,
//   });

//   return d ? d.data_point : null;
// }



function range(sortedValues) {
  if (sortedValues.length === 0) return 'none';
  if (sortedValues.length === 1) return _.first(sortedValues);
  return `${_.first(sortedValues)} - ${_.last(sortedValues)}`;
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
