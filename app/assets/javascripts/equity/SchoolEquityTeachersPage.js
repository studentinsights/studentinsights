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

function randomValue() {
  return Math.round(Math.random()*100);
}

const width = 165;
const styles = {
  root: {
    overflowY: 'hidden',
    overflowX: 'hidden',
    height: 580, // TODO(kr)
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  loader: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  sectionHeading: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 0
  },
  classrooms: {
    padding: 10
  },
  padded: {
    margin: 10
  },
  students: {
    padding: 10,
    paddingTop: 0,
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  links: {
    fontSize: 12,
    paddingLeft: 10
  },
  link: {
    display: 'inline-block',
    padding: 5,
    fontSize: 12
  },
  studentsGrid: {
    flex: 1,
    overflowY: 'scroll',
    overflowX: 'hidden',
    border: '1px solid #ccc'
  },
  listsContainer: {
    display: 'flex'
  },
  indicator: {
    fontSize: 12
  },
  column: {
    width: width,
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    padding: 10
  },
  listStyle: {
    backgroundColor: '#eee',
    border: '1px solid #ccc',
    height: 180,
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
    this.state = {
      slots: props.students.reduce((map, student) => {
        return {...map, [student.id]: Math.floor(Math.random()*rooms.length + 1)};
      }, {})
    };
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderContent = this.renderContent.bind(this);
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
      <div className="SchoolEquityTeachersPage" style={styles.root}>
        <ExperimentalBanner />
        <GenericLoader
          style={styles.loader}
          promiseFn={this.fetchStudents}
          render={this.renderContent} />
      </div>
    );
  }

  renderContent(json) {
    const {grade} = this.props;
    const {students, school} = json;
    const {slots} = this.state;
    const rooms = ['Room A', 'Room B', 'Room C', 'Room D', 'Room E'];
    return (
      <div style={styles.content}>
        <div style={styles.classrooms}>
          <SectionHeading style={styles.sectionHeading}>Classroom communities: {gradeText(grade)} at {school.name}</SectionHeading>
          <div style={styles.padded}>
            <div style={styles.listsContainer}>
              <div key="unplaced" style={styles.column}>
                <h2>Not yet placed</h2>
              </div>
              {rooms.map(room =>
                <div key={room} style={styles.column}>
                  <h2>{room}</h2>
                  <div style={styles.indicator}>Students: {12}</div>
                  <div style={styles.indicator}>{'\u00A0'}</div>
                  <div style={styles.indicator}>{this.renderValue('Low income', randomValue())}</div>
                  <div style={styles.indicator}>{this.renderValue('ELL', randomValue())}</div>
                  <div style={styles.indicator}>{this.renderValue('SPED', randomValue())}</div>
                  <div style={styles.indicator}>{this.renderValue('<25th Math', randomValue())}</div>
                  <div style={styles.indicator}>{this.renderValue('<25th ELA', randomValue())}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={styles.students}>
          <SectionHeading style={styles.sectionHeading}>Students to place: {students.length}</SectionHeading>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={styles.links}>
              Sort by:
              <a href="#" style={styles.link}>not yet placed</a>
              <a href="#" style={styles.link}>classroom</a>
              <a href="#" style={styles.link}>alphabetical</a>
            </div>
            <div style={styles.links}>
              Actions:
              <a href="#" style={styles.link}>reset to blank</a>
              <a href="#" style={styles.link}>randomly assign not yet placed</a>
            </div>
          </div>
          <div style={styles.studentsGrid}>
            {students.map(s => {
              const left = width * slots[s.id];
              return <StudentCard key={s.id} style={{display: 'block', position: 'relative', left}} student={s} />;
            })}
          </div>
        </div>
      </div>
    );
  }

  renderValue(text, value) {
    return (value > 80)
      ? <span style={{color: '#3177c9'}}>{text}: {value}%</span>
      : <span style={{color: '#ccc'}}>{text}: {value}%</span>;
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