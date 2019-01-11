import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {AutoSizer} from 'react-virtualized';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import MockStudentPhoto from '../components/MockStudentPhoto';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
// TODO(kr) check import
import {
  reordered,
  insertedInto,
  consistentlyPlacedInitialStudentIdsByRoom
} from '../class_lists/studentIdsByRoomFunctions';


//circles
export default class ReadingGroupingPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
    updateGlobalStylesToRemoveHorizontalScrollbars();
  }

  fetchJson() {
    const {schoolId, grade} = this.props;
    const url = `/api/schools/${schoolId}/reading/${grade}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="ReadingGroupingPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const {schoolId, grade} = this.props;
    return (
      <ReadingGroupingPageView
        schoolId={schoolId}
        grade={grade}
        classroomsCount={9}
        readingStudents={json.reading_students}
        dibelsDataPoints={json.dibels_data_points}
        mtssNotes={json.latest_mtss_notes}
      />
    );
  }
}
ReadingGroupingPage.propTypes ={
  schoolId: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired
};


export class ReadingGroupingPageView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      studentIdsByRoom: consistentlyPlacedInitialStudentIdsByRoom(props.classroomsCount, props.readingStudents)
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  withMerged(students) {
    const {dibelsDataPoints, mtssNotes} = this.props;
    const dibelsByStudentId = _.groupBy(dibelsDataPoints, 'student_id');
    const mtssByStudentId = _.groupBy(mtssNotes, 'student_id');
    return students.map(student => {
      return {
        ...student,
        dibels: dibelsByStudentId[student.id] || [],
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
    const {readingStudents} = this.props;
    const {studentIdsByRoom} = this.state;
    const students = this.withMerged(readingStudents);

    return (
      <div>
        <SectionHeading>Reading Groups: 3rd grade at Arthur D. Healey</SectionHeading>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div>
            {Object.keys(studentIdsByRoom).map(groupKey => {
              const studentsInRoom = studentIdsByRoom[groupKey].map(studentId => {
                return _.find(students, { id: studentId });
              });
              return this.renderRow(groupKey, studentsInRoom);
            })}
          </div>
        </DragDropContext>
      </div>
    );
  }

  renderRow(groupKey, studentsInGroup) {
    return (
      <div key={groupKey} style={{
        // border: '1px solid #eee',
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        margin: 5
      }}>
        {this.renderGroupName(groupKey, studentsInGroup)}
        <Droppable
          droppableId={groupKey}
          direction="horizontal"
          type="GROUP">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{display: 'flex'}}
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


  renderGroupName(groupKey, studentsInGroup) {
    const fAndPs = _.uniq(_.compact(studentsInGroup.map(latestFAndP))).sort();
    const wpms = _.uniq(_.compact(studentsInGroup.map(student => tryDibels(student.dibels, '3', 'fall', 'dibels_dorf_wpm')))).sort((a, b) => a - b);
    const accs = _.uniq(_.compact(studentsInGroup.map(student => tryDibels(student.dibels, '3', 'fall', 'dibels_dorf_acc')))).sort((a, b) => a - b);

    const fakeNames = {
      'room:unplaced': 'Not yet placed',
      'room:0':'Bougas',
      'room:1':'Garton',
      'room:2':'Hermann',
      'room:3':'Connoly',
      'room:4':'Stern',
      'room:5':'Robinson',
      'room:7':'Buckwalter',
      'room:6':'Harel',
      'room:8':'Springsteen',
      'room:9':'Miranda'
    };
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
          <div>{fakeNames[groupKey]}</div>
          <div>5 x 30m</div>
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
    // return (
    //   <MockStudentPhoto
    //     key={student.id}
    //     style={{maxWidth: 64, maxHeight: 64, margin: 1}}
    //     student={student}
    //   />
    // );

    if (window.location.search.indexOf('names') !== -1) {
      return (
        <div style={{
          width: 64,
          height: 64,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div>{student.first_name} {student.last_name.slice(0, 1)}</div>
        </div>
      );
    }


    return (
      <div style={{
        width: 64,
        height: 64,
        position: 'relative',
        marginRight: 1
      }}>
        <MockStudentPhoto
          key={student.id}
          style={{position: 'absolute', maxWidth: 64, maxHeight: 64}}
          student={student}
        />
        <div style={{position: 'absolute', left: 2, bottom: 0, color: 'white', fontSize: 10}}>{student.first_name}</div>
      </div>
    );
  }
}
ReadingGroupingPageView.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
ReadingGroupingPageView.propTypes = {
  schoolId: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired,
  readingStudents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired
  })).isRequired,
  classroomsCount: PropTypes.number.isRequired,
  dibelsDataPoints: PropTypes.arrayOf(PropTypes.shape({
    student_id: PropTypes.number.isRequired,
    grade: PropTypes.string.isRequired,
    assessment_period: PropTypes.string.isRequired,
    assessment_key: PropTypes.string.isRequired,
    data_point: PropTypes.string.isRequired
  })).isRequired,
  mtssNotes: PropTypes.arrayOf(PropTypes.shape({
    student_id: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    recorded_at: PropTypes.string.isRequired,
  })).isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
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



// relies on already sorted
function tryLatest(key, list) {
  const obj = _.first(list);
  return obj ? obj[key] : null;
}

function latestDibels(student) {
  return tryLatest('benchmark', student.dibels_results);
}
function latestFAndP(student) {
  return tryLatest('instructional_level', student.f_and_p_assessments);
}
function latestStar(student) {
  return tryLatest('percentile_rank', student.star_reading_results);
}

function tryDibels(dibels, grade, assessmentPeriod, assessmentKey) {
  const d = _.find(dibels, {
    grade,
    assessment_period: assessmentPeriod,
    assessment_key: assessmentKey,
  });

  return d ? d.data_point : null;
}



function range(sortedValues) {
  if (sortedValues.length === 0) return 'none';
  if (sortedValues.length === 1) return _.first(sortedValues);
  return `${_.first(sortedValues)} - ${_.last(sortedValues)}`;
}
