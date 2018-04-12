import React from 'react';
import Hover from '../components/Hover';
import Card from '../components/Card';
import {studentAge} from '../helpers/studentAge';

// Shows a student card in the `ClassroomListCreator` UI
export default class StudentCard extends React.Component {
  constructor(props) {
    super(props);
    this.onMoreClick = this.onMoreClick.bind(this);
  }

  onMoreClick(e) {
    e.preventDefault();
    alert('hi');
  }

  render() {
    const now = this.context.nowFn();
    const {student, style} = this.props;
    const containerStyle = {
      fontSize: 12,
      border: '1px solid #eee',
      marginBottom: 1,
      marginTop: 1,
      cursor: 'pointer',
      borderRadius: 3,
      background: 'white'
    };
    return (
      <Hover style={{display: 'inline-block'}}>{isHovering => {
        const hoverStyle = (isHovering)
           ? {backgroundColor: '#eee', border: '1px solid #ccc'}
           : {backgroundColor: 'white', border: '1px solid #eee'};
        return (
          <div
            onClick={this.onMoreClick}
            className="StudentCard"
            style={{...containerStyle, ...style, ...hoverStyle}}>
            <div style={{padding: 5}}>{student.first_name} {student.last_name}</div>
          </div>
        );
      }}</Hover>
    );
  }
}
StudentCard.propTypes= {
  student: React.PropTypes.object.isRequired,
  style: React.PropTypes.object
};

StudentCard.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};