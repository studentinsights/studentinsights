import React from 'react';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import Card from '../components/Card';
import ExperimentalBanner from '../components/ExperimentalBanner';
import SectionHeading from '../components/SectionHeading';
import {gradeText} from '../helpers/gradeText';
import {toMomentFromTime} from '../helpers/toMoment';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function age(nowMoment, dateOfBirthText) {
  const birthMoment = toMomentFromTime(dateOfBirthText);
  return nowMoment.clone().diff(birthMoment, 'year');
}

const width = 160;
const styles = {
  content: {
    margin: 10
  },
  listsContainer: {
    display: 'flex'
  },
  column: {
    width: width
  },
  listStyle: {
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    height: 220,
    width: width
  },
  itemStyle: {
    userSelect: 'none'
  },
  leftListStyle: {
    width: width
  }
};

// For grade-level teaching teams 
export default class SchoolEquityTeachersPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderLists = this.renderLists.bind(this);
  }

  // TODO(KR) this wouldn't work for teacher authorization; this is just placeholder
  // TODO(KR) authorization is tricky since we're not using the same rules here.
  fetchStudents() {
    const {schoolId} = this.props;
    const url = `/schools/${schoolId}/overview_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="SchoolEquityTeachersPage">
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchStudents}
          render={this.renderLists} />
      </div>
    );
  }

  renderLists(json) {
    const {grade} = this.props;
    const {students, school} = json;
    const rooms = ['Not yet placed', 'Room A', 'Room B', 'Room C', 'Room D', 'Room E'];
    return (
      <div>
        <SectionHeading>Classroom communities: {gradeText(grade)} at {school.name}</SectionHeading>
        <div style={styles.content}>
          <div style={styles.listsContainer}>
            {rooms.map(room =>
              <div key={room} style={styles.column}>
                <h2 style={{padding: 5}}>{room}</h2>
                <List
                  students={[]}
                  listStyle={styles.listStyle}
                  itemStyle={styles.itemStyle} />
              </div>
            )}
          </div>
          <div style={{marginTop: 20}}>
            <h2>Students to place: {students.length}</h2>
            <a href="#" style={{display: 'inline-block', padding: 5}}>Sort by classroom</a>
            <a href="#" style={{display: 'inline-block', padding: 5}}>Randomly place remaining students</a>
            <a href="#" style={{display: 'inline-block', padding: 5}}>Reset to blank</a>
            {students.map(s => <StudentCard key={s.id} style={{display: 'block', position: 'relative', left: width*Math.floor(Math.random()*rooms.length)}} student={s} />)}
          </div>
        </div>
      </div>
    );
  }
}
SchoolEquityTeachersPage.propTypes = {
  schoolId: React.PropTypes.string.isRequired,
  grade: React.PropTypes.string.isRequired
};



// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

class List extends React.Component {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.state = {
      items: props.students
    };
  }

  getListStyle(isDraggingOver) {
    const {listStyle} = this.props;
    return {
      ...listStyle
    };
  }

  getItemStyle(isDragging, draggableStyle) {
    const {itemStyle} = this.props;
    return {
      ...itemStyle,
      background: isDragging ? 'lightgreen' : '#eee',
      ...draggableStyle,
    };
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      items,
    });
  }

  render() {
    const {items} = this.state;
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={this.getListStyle(snapshot.isDraggingOver)}
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div>
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={this.getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        {this.renderItem(item)}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  renderItem(item) {
    return <StudentCard student={item} />;
  }
}

class StudentCard extends React.Component {
  render() {
    const now = this.context.nowFn();
    const {student, style} = this.props;
    return (
      <Card style={{width: width, fontSize: 12, ...style}}>
        <div>{student.first_name} {student.last_name}</div>
        <div>{age(now, student.date_of_birth)} years old</div>
        <div>{student.limited_english_proficiency || '\u00A0'}</div>
      </Card>
    );
  }
}
StudentCard.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};