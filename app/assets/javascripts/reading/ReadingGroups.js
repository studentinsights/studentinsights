import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import SectionHeading from '../components/SectionHeading';
import StudentPhoto from '../components/StudentPhoto';
import MockStudentPhoto from '../components/MockStudentPhoto';


// TODO(kr) import path
import {
  reordered,
  insertedInto,
  UNPLACED_ROOM_KEY,
  consistentlyPlacedInitialStudentIdsByRoom
} from '../class_lists/studentIdsByRoomFunctions';



// For making and reviewing reading groups.
export default class ReadingGroups extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      studentIdsByRoom: consistentlyPlacedInitialStudentIdsByRoom(groups(props.classrooms).length, props.readingStudents)
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
            {groups(classrooms).map(group => {
              const {groupKey} = group;
              const studentsInRoom = studentIdsByRoom[groupKey].map(studentId => {
                return _.find(students, { id: studentId });
              });
              return this.renderRow(group, studentsInRoom);
            })}
          </div>
        </DragDropContext>
      </div>
    );
  }

  renderRow(group, studentsInGroup) {
    const {text, groupKey} = group;
    return (
      <div key={groupKey} style={{
        // border: '1px solid #eee',
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        margin: 5
      }}>
        {this.renderGroupName(groupKey, text, studentsInGroup)}
        <Droppable
          droppableId={groupKey}
          direction="horizontal"
          type="GROUP">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{display: 'flex', flex: 1}}
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


  renderGroupName(groupKey, classroomText, studentsInGroup) {
    const [fAndPs, wpms, accs] = [[], [], []]; // TODO(kr) make this work
    // const fAndPs = _.uniq(_.compact(studentsInGroup.map(latestFAndP))).sort();
    // const wpms = _.uniq(_.compact(studentsInGroup.map(student => tryDibels(student.dibels, '3', 'fall', 'dibels_dorf_wpm')))).sort((a, b) => a - b);
    // const accs = _.uniq(_.compact(studentsInGroup.map(student => tryDibels(student.dibels, '3', 'fall', 'dibels_dorf_acc')))).sort((a, b) => a - b);
    return (
      <div style={{
        display: 'flex',
        padding: 5,
        fontSize: 12,
        marginBottom: 5,
        marginRight: 5,
        height: 64,
        background: '#f8f8f8',
        color: 'black',
        border: '1px solid #eee'
      }}>
        <div style={{width: '8em'}}>
          <div>{classroomText}</div>
        </div>
        <div style={{paddingLeft: 5, width: '10em', marginLeft: 10, borderLeft: '1px solid #ddd'}}>
          <div>F&P: {fAndPs.join(' ')}</div>
          <div>ACC: {range(accs)}</div>
          <div>WPM: {range(wpms)}</div>
        </div>
      </div>
    );
  }

  renderItem(student) {
    const useMockPhoto = (window.location.search.indexOf('mock') !== -1);
    const photoProps = {
      key: student.id,
      style:{
        position: 'absolute',
        maxWidth: 64,
        maxHeight: 64
      },
      student: student
    };

    return (
      <div style={{
        width: 64,
        height: 64,
        position: 'relative',
        marginRight: 1
      }}>
        {useMockPhoto
          ? <MockStudentPhoto {...photoProps} />
          : <StudentPhoto {...photoProps} />}
        />
        <div style={{position: 'absolute', left: 2, bottom: 0, color: 'white', fontSize: 10}}>{student.first_name}</div>
      </div>
    );
  }
}
ReadingGroups.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
ReadingGroups.propTypes = {
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
  })).isRequired
};


// const styles = {
//   flexVertical: {
//     display: 'flex',
//     flex: 1,
//     flexDirection: 'column'
//   }
// };



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
    text: 'Not yet placed'
  };
  return [unplacedGroup].concat(classrooms.map((classroom, index) => {
    return {
      ...classroom,
      groupKey: ['room', index].join(':')
    };
  }));
}