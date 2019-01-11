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

    return (
      <div>
        <SectionHeading>Reading Groups: 3rd grade at Arthur D. Healey</SectionHeading>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <div>
            {Object.keys(studentIdsByRoom).map(groupKey => {
              const studentsInRoom = studentIdsByRoom[groupKey].map(studentId => {
                return _.find(readingStudents, { id: studentId });
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
        {this.renderGroupName(groupKey)}
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


  renderGroupName(groupKey) {
    return (
      <div style={{
        display: 'flex',
        padding: 5,
        fontSize: 12,
        marginBottom: 5,
        background: '#ccc',
        color: 'black'
      }}>
        <div style={{width: '8em'}}>
          <div>K. Robinson</div>
          <div>5 x 30m</div>
          <div>{groupKey}</div>
        </div>
        <div style={{width: '8em', marginLeft: 10, borderLeft: '1px solid #aaa'}}>
          <div>N - R</div>
          <div>80 - 115</div>
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