import React from 'react';
import PropTypes from 'prop-types';
import * as Routes from '../helpers/Routes';
import InsightQuote, {Resizing, fontSizeStyle} from './InsightQuote';


// Render an insight from a student with direct quote.
export default function InsightFromStudent(props) {
  const {className, promptText, responseText, student, inWhatWhenEl} = props;
  return (
    <InsightQuote
      className={['InsightFromStudent', className].join(' ')}
      quoteEl={
        <Resizing
          promptText={promptText}
          responseText={`“${responseText}”`}
        />
      }
      sourceEl={
        <div>
          <div>from <a style={fontSizeStyle} href={Routes.studentProfile(student.id)} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a></div>
          <div>{inWhatWhenEl}</div>
        </div>
      }
    />
  );
}
InsightFromStudent.propTypes = {
  promptText: PropTypes.string.isRequired,
  responseText: PropTypes.string.isRequired,
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
  }).isRequired,
  inWhatWhenEl: PropTypes.node.isRequired,
  className: PropTypes.string
};
