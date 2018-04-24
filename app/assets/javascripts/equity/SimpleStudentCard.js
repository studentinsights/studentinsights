import React from 'react';
import {DragSource} from 'react-dnd';



export class SimpleStudentCard extends React.Component {
  render() {
    const {student, connectDragSource, isDragging} = this.props;
    return connectDragSource(
      <div
        key={student.id}
        style={{
          ...styles.studentCard,
          ...(isDragging ? styles.isDragging : {})
        }}>
        {student.first_name} {student.last_name}
      </div>
    );
  }
}
SimpleStudentCard.propTypes = {
  student: React.PropTypes.object.isRequired,
  connectDragSource: React.PropTypes.func.isRequired,
  isDragging: React.PropTypes.bool.isRequired
};

const styles = {
  studentCard: {
    fontSize: 12,
    border: '1px solid #eee',
    marginBottom: 1,
    marginTop: 1,
    padding: 5,
    cursor: 'pointer',
    borderRadius: 3,
    background: 'white'
  },
  isDragging: {
    opacity: 0.25
  }
};


// These are React DND methods.
function beginDrag(props) {
  return { student: props.student };
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export default DragSource('SimpleStudentCard', {beginDrag}, collect)(SimpleStudentCard);
