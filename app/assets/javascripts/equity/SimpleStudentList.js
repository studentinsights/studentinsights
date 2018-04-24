import React from 'react';
import {DragSource} from 'react-dnd';



export default class SimpleStudentList extends React.Component {
  render() {
    return <div>...list...</div>;
  }
}
SimpleStudentList.propTypes = {
  // student: React.PropTypes.object.isRequired,
  // connectDragSource: React.PropTypes.func.isRequired,
  // isDragging: React.PropTypes.bool.isRequired
};

// const styles = {
//   studentCard: {
//     fontSize: 12,
//     border: '1px solid #eee',
//     marginBottom: 1,
//     marginTop: 1,
//     padding: 5,
//     cursor: 'pointer',
//     borderRadius: 3,
//     background: 'white'
//   },
//   isDragging: {
//     opacity: 0.25
//   }
// };


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

// export default DragSource('SimpleStudentList', {beginDrag}, collect)(SimpleStudentList);
