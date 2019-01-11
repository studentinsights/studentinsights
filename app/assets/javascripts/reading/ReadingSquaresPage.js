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
  initialStudentIdsByRoom
} from '../class_lists/studentIdsByRoomFunctions';


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
      studentIdsByRoom: initialStudentIdsByRoom(props.classroomsCount, props.readingStudents)
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(dragEndResult) {
    const {studentIdsByRoom} = this.state;
    const updatedStudentIdsByRoom = studentIdsByRoomAfterDrag(studentIdsByRoom, dragEndResult);
    this.setState({studentIdsByRoom: updatedStudentIdsByRoom});
  }

  render() {
    const {readingStudents, classroomsCount} = this.props;
    const [WIDTH, HEIGHT] = [3, 3];
    const groupKeys = _.range(0, classroomsCount).map(i => `group:${i}`);
    return (
      <div style={styles.flexVertical}>
        <SectionHeading>Reading Groups: 3rd grade at Arthur D. Healey</SectionHeading>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div style={{flex: 1, display: 'flex', background: '#f8f8f8'}}>
            {_.range(0, HEIGHT).map(rowIndex => (
              <div key={rowIndex} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                {_.range(0, WIDTH).map(columnIndex => {
                  const groupIndex = rowIndex*WIDTH+columnIndex;
                  const groupKey = groupKeys[groupIndex];
                  const studentsInGroup = readingStudents.slice(groupIndex*3, groupIndex*3+2);
                  return (
                    <div key={groupKey} style={{
                      border: '1px solid #eee',
                      display: 'inline-block',
                      flex: 1,
                      margin: 5
                    }}>
                      <div style={{
                        padding: 5,
                        marginBottom: 5,
                        background: '#ccc',
                        color: 'black'
                      }}>{groupKey}</div>
                      <Droppable
                        droppableId={groupKey}
                        type="GROUP">
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef}>
                            <div>{studentsInGroup.map(this.renderStudent, this)}</div>
                            <div>{provided.placeholder}</div>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    );
  }

  renderStudent(student, index) {
    return (
      <Draggable key={student.id} draggableId={`StudentCard:${student.id}`} index={index}>
        {(provided, snapshot) => {
          return this.renderClickableStudentCard(student, {
            ref: provided.innerRef,
            placeholder: provided.placeholder,
            propsFromDraggable: {
              ...provided.draggableProps,
              ...provided.dragHandleProps
            }
          });
        }}
      </Draggable>
    );
  }

  // Optionally pass arguments to make this work as a Draggable
  renderClickableStudentCard(student, options = {}) {
    const {ref, placeholder, propsFromDraggable = {}} = options;
    return (
      <div>
        <div ref={ref} {...propsFromDraggable}>
          {this.renderActual(student)}
        </div>
        {placeholder /* this preserves space when dragging */}
      </div>
    );
  }


  renderActual(student) {
    return (
      <MockStudentPhoto
        key={student.id}
        style={{display: 'inline-block', maxWidth: 64, maxHeight: 64}}
        student={student}
      />
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
  classroomsCount: PropTypes.number.isRequired
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