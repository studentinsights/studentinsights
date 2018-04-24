import React from 'react';
import {Draggable} from 'react-beautiful-dnd';
import Modal from 'react-modal';

export default class SimpleStudentCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false
    };

    this.onClick = this.onClick.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  onClick() {
    this.setState({modalIsOpen: true});
  }

  onClose() {
    this.setState({modalIsOpen: false});
  }

  render() {
    const {student, index} = this.props;
    const {modalIsOpen} = this.state;
    return (
      <Draggable draggableId={`SimpleStudentCard:${student.id}`} index={index}>
        {(provided, snapshot) => {
          return (
            <div>
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={this.onClose}
                contentLabel="Modal"
              >
                <div>#{student.id}: {student.first_name} {student.last_name}</div>
              </Modal>
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <div style={styles.studentCard} onClick={this.onClick}>
                  <span>{student.first_name} {student.last_name}</span>
                  <span style={{float: 'right'}}>
                    <svg fill="#ccc" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0h24v24H0z" fill="none"/>
                      <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </span>
                </div>
              </div>
              {provided.placeholder /* this preserves space when dragging */}
            </div>
          );
        }}
      </Draggable>
    );
  }
}
SimpleStudentCard.propTypes = {
  student: React.PropTypes.object.isRequired,
  index: React.PropTypes.number.isRequired
  // connectDragSource: React.PropTypes.func.isRequired,
  // isDragging: React.PropTypes.bool.isRequired
};

const styles = {
  studentCard: {
    fontSize: 14,
    border: '1px solid #eee',
    padding: 6,
    cursor: 'pointer',
    borderRadius: 3,
    background: 'white'
  },
  isDragging: {
    opacity: 0.25
  }
};


// // These are React DND methods.
// function beginDrag(props) {
//   return { student: props.student };
// }

// function collect(connect, monitor) {
//   return {
//     connectDragSource: connect.dragSource(),
//     isDragging: monitor.isDragging()
//   };
// }

// export default DragSource('SimpleStudentCard', {beginDrag}, collect)(SimpleStudentCard);
