import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from '../components/SectionHeading';
const styles = {
  textarea: {
    marginTop: 20,
    fontSize: 14,
    border: '1px solid #eee',
    width: '100%' //overriding strange global CSS, should cleanup
  }
};

class TransitionNotes extends React.Component {

  render() {
    return (
      <div style={{display: 'flex'}}>
        <div style={{flex: 1, margin: 30}}>
          <SectionHeading>
            High School Transition Note
          </SectionHeading>
          <textarea
            rows={10}
            style={styles.textarea}
            ref={function(ref) { this.textareaRef = ref; }.bind(this)}
            value={''} />
        </div>
        <div style={{flex: 1, margin: 30}}>
          <SectionHeading>
            High School Transition Note (Restricted)
          </SectionHeading>
          <textarea
            rows={10}
            style={styles.textarea}
            ref={function(ref) { this.textareaRef = ref; }.bind(this)}
            value={''} />
        </div>
      </div>
    );
  }

}

TransitionNotes.propTypes = {
  readOnly: PropTypes.bool.isRequired,
};

export default TransitionNotes;

