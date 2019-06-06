import React from 'react';
import PropTypes from 'prop-types';
import Hover from '../components/Hover';
import {high, medium, low} from '../helpers/colors';
import ReaderProfileDialog from './ReaderProfileDialog';
import {cellStyles} from './layout';


const SUPPORT_COLOR = '#1b82ea42';

// A container for a suggestion
export function Suggestion(props) {
  const {text, dialog} = props;

  return (
    <Hover className="Suggestion">{isHovering => {
      const style = {
        ...cellStyles, 
        padding: 5,
        cursor: 'pointer',
        ...(isHovering ? {color: 'black', background: SUPPORT_COLOR} : {color: '#ccc'})
      };
      return (
        <ReaderProfileDialog
          title={text}
          content={dialog || `Here are some suggestions for ${text}...`}
          icon={<div style={style}>{text}</div>}
        />
      );
    }}</Hover>
  );
}
Suggestion.propTypes = {
  text: PropTypes.string.isRequired,
  dialog: PropTypes.node
};


// Color the background of the children based
// on the `concernKey`, keeping this the same
// color scheme.
export function Concern(props) {
  const {concernKey, children, style} = props;
  const concernStyle = {
    low: {backgroundColor: high},
    medium: {backgroundColor: medium},
    high: {backgroundColor: low},
    unknown: {backgroundColor: '#ccc'}
  }[concernKey];

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      height: '100%',
      ...concernStyle,
      ...style
    }}>{children}</div>
  );
}
Concern.propTypes = {
  concernKey: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  style: PropTypes.object
};


export function Support(props) {
  const {children, style} = props;
  return (
    <div className="Support" style={{
      display: 'flex',
      flex: 1,
      height: '100%',
      backgroundColor: SUPPORT_COLOR,
      ...style
    }}>{children}</div>
  );
}
Support.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object
};


// for a header of a chip (note, iep, service).
export const noteChipHeaderStyle = {
  display: 'inline-block',
  padding: 3,
  paddingLeft: 8,
  paddingRight: 8
};

// for the chip (note, iep, service)
export const noteChipStyle = {
  textAlign: 'left',
  fontSize: 12,
  outline: '1px solid white',
  height: '100%',
};


export function Why(props) {
  const {children, style} = props;
  return (
    <div className="Why" style={{
      padding: 10,
      background: '#0366d61a',
      border: '1px solid #0366d61a',
      marginTop: 10,
      marginBottom: 10,
      ...style
    }}>{children}</div>
  );
}
Why.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object
};


// UI for a score for a single data point number
export function ScoreBadge(props) {
  const {score, concernKey, innerStyle} = props;
  return (
    <Concern
      concernKey={concernKey}
      style={{
        display: 'inline-block',
        height: 'auto'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 18,
        width: '1.5em',
        height: '1.5em',
        color: 'white',
        ...innerStyle
      }}>{score}</div>
    </Concern>
  );
}
ScoreBadge.propTypes = {
  score: PropTypes.string.isRequired,
  concernKey: PropTypes.string.isRequired,
  innerStyle: PropTypes.object
};