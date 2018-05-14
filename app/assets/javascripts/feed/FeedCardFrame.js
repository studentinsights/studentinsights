import React from 'react';
import Card from '../components/Card';
import Homeroom from '../components/Homeroom';
import {gradeText} from '../helpers/gradeText';


// Render a card in the feed for an EventNote
class FeedCardFrame extends React.Component {
  render() {
    const {style, student, byEl, whereEl, whenEl, children, badgesEl} = this.props;
    const {homeroom} = student;
    
    return (
      <Card className="FeedCardFrame" style={style}>
        <div style={styles.header}>
          <div style={styles.studentHeader}>
            <div>
              <div>
                <a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a>
              </div>
              <div>{gradeText(student.grade)}</div>
              <div>
                {homeroom && <Homeroom
                  id={homeroom.id}
                  name={homeroom.name}
                  educator={homeroom.educator} />}
              </div>
            </div>
          </div>
          <div style={styles.by}>
            <div>{byEl}</div>
            <div>{whereEl}</div>
            <div>{whenEl}</div>
          </div>
        </div>
        <div style={styles.body}>
          {children}
        </div>
        <div style={styles.footer}>
          {badgesEl}
        </div>
      </Card>
    );
  }
}
FeedCardFrame.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
FeedCardFrame.propTypes = {
  student: React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    first_name: React.PropTypes.string.isRequired,
    last_name: React.PropTypes.string.isRequired,
    grade: React.PropTypes.string.isRequired,
    house: React.PropTypes.string,
    homeroom: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      educator: React.PropTypes.object
    })
  }).isRequired,
  children: React.PropTypes.node.isRequired,
  byEl: React.PropTypes.node,
  whereEl: React.PropTypes.node,
  whenEl: React.PropTypes.node,
  badgesEl: React.PropTypes.node,
  style: React.PropTypes.object
};


const styles = {
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  studentHeader: {
    display: 'flex',
    alignItems: 'center'
  },
  body: {
    marginBottom: 20,
    marginTop: 20
  },
  by: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  person: {
    fontWeight: 'bold'
  }
};

export default FeedCardFrame;