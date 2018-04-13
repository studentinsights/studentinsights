import React from 'react';
import Hover from '../components/Hover';
import Card from '../components/Card';
import HelpBubble from '../components/HelpBubble';
import {studentAge} from '../helpers/studentAge';

// Shows a student card in the `ClassroomListCreator` UI
export default class StudentCard extends React.Component {
  constructor(props) {
    super(props);
    this.onMoreClick = this.onMoreClick.bind(this);
  }

  onMoreClick(e) {
    e.preventDefault();
    console.log('hi, card clicked');
  }

  render() {
    const now = this.context.nowFn();
    const {student, width, style} = this.props;
    const padding = 5;
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
            style={{...containerStyle, ...style, ...hoverStyle, width: width}}>            
            {/* hacked */}
            <HelpBubble
              el={<div style={{padding}}>{student.first_name} {student.last_name}</div>}
              title={`${student.first_name} ${student.last_name}`}
              content={<div>yo</div>}
            />
          </div>
        );
      }}</Hover>
    );
  }
}
StudentCard.propTypes= {
  student: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  style: React.PropTypes.object
};

StudentCard.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};