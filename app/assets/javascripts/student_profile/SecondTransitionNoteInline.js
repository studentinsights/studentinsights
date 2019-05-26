import React from 'react';
import PropTypes from 'prop-types';
import SecondTransitionNoteDialog, {renderAsText} from './SecondTransitionNoteDialog';
import NoteText from '../components/NoteText';


export default class SecondTransitionNoteInline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  render() {
    const {json, studentFirstName} = this.props;
    const {isOpen} = this.state;
    const text = renderAsText(json);

    return (
      <div className="SecondTransitionNoteInline">
        <NoteText text={text} />
        <a style={styles.link} href="#" onClick={e => {
          e.preventDefault();
          this.setState({isOpen: true});
        }}>Edit transition note</a>
        {isOpen && (
          <SecondTransitionNoteDialog
            student={{
              id: json.student_id,
              first_name: studentFirstName
            }}
            initialDoc={docFromJson(json)}
            onClose={() => this.setState({isOpen: false})}
          />
        )}
      </div>
    );
  }
}
SecondTransitionNoteInline.propTypes = {
  json: PropTypes.object.isRequired,
  studentFirstName: PropTypes.string.isRequired
};

const styles = {
  link: {
    display: 'block',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10
  }
};

function docFromJson(json) {
  return {
    isStarred: json.form_json.is_starred,
    formJson: {
      strengths: json.form_json.strengths,
      connecting: json.form_json.connecting,
      community: json.form_json.community,
      peers: json.form_json.peers,
      family: json.form_json.family,
      other: json.form_json.other
    },
    restrictedText: json.form_json.restricted_text
  };
}