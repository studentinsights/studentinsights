import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Hover from '../components/Hover';
import {AutoSizer} from 'react-virtualized';
import {high, medium, low} from '../helpers/colors';
import ReaderProfileDialog from './ReaderProfileDialog';


const SUPPORT_COLOR = '#1b82ea42';

// An main "ingredient" of reading (eg, phonics).
export function Ingredient(props) {
  const {name, notes, subs, isLast} = props;
  const color = '#eee';
  return (
    <div className="Ingredient">
      <div style={{padding: 2, background: color, borderRadius: 30}}>
        <div style={{
          marginLeft: 15,
          padding: 5,
          fontSize: 16,
          color: 'black',
          fontWeight: 'bold'
        }}>{name}</div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 15,
        marginRight: 15,
        ...(isLast ? {borderBottom: `3px solid ${color}`}: {})
      }}>
        <div style={{
          paddingLeft: 10,
          borderLeft: `3px solid ${color}`,
        }}>{subs.map((sub, index) => <div key={index}>{sub}</div>)}</div>
        <div style={{
          flex: 1,
          borderRight: `1px solid ${color}`
        }}>{notes}</div>
      </div>
    </div>
  );
}
Ingredient.propTypes = {
  name: PropTypes.node.isRequired,
  notes: PropTypes.node.isRequired,
  subs: PropTypes.arrayOf(PropTypes.node).isRequired,
  isLast: PropTypes.bool
};


// A part of an 'ingredient' (eg, "blending")
export function Sub(props) {
  const {name, screener, diagnostic, intervention} = props;  
  return (
    <div className="Sub" style={{display: 'flex', flexDirection: 'row'}}>
      <div style={styles.nameCell}>{name}</div>
      <div style={styles.cell}>{screener || <PlaceholderSuggestion text="screener" />}</div>
      <div style={styles.cell}>{diagnostic || <PlaceholderSuggestion text="diagnostic" />}</div>
      <div style={styles.cell}>{intervention || <PlaceholderSuggestion text="intervention" />}</div>
    </div>
  );
}
Sub.propTypes = {
  name: PropTypes.node.isRequired,
  screener: PropTypes.node,
  diagnostic: PropTypes.node,
  intervention: PropTypes.node,
};


// The UI layout for multiple chips, side-by-side
export function MultipleChips(props) {
  const {chips} = props;
  return <div className="MultipleChips" style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%'
  }}>{_.compact(chips).map((chip, index) => (
    <div key={index} style={{
      flex: 1,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      position: 'relative',
      height: '100%'
    }}>{chip}</div>
  ))}</div>;
}
MultipleChips.propTypes = {
  chips: PropTypes.arrayOf(PropTypes.node).isRequired
};


export function NotesContainer(props) {
  const {children} = props;
  return <div className="NotesContainer" style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%'
  }}>{_.compact(children)}</div>;
}
NotesContainer.propTypes = {
  children: PropTypes.node.isRequired
};


function PlaceholderSuggestion(props) {
  const {text} = props;
  return <div style={{padding: 5, fontSize: 12, color: '#eee'}}>{text}</div>;
}

export function Suggestion(props) {
  const {text, dialog} = props;

  return (
    <Hover>{isHovering => {
      const style = {
        ...styles.cell, 
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


// Color the background of the children based
// on the `concernKey`, keeping this the same
// color scheme.
export function Concern(props) {
  const {concernKey, children, style} = props;
  const concernStyle = {
    low: {backgroundColor: high},
    medium: {backgroundColor: medium},
    high: {backgroundColor: low},
    unknown: {backgroundColor: '#eee'}
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
    

// A chip that's two lines, truncated if overflowing.
// Can also pass functions that can render different content
// based on the width (eg, if multiple chips).
export function TwoLineChip(props) {
  const {firstLine, secondLine, style} = props;
  
  return (
    <AutoSizer disableHeight>{({width}) => {
      const lines = _.compact([
        (_.isFunction(firstLine) ? firstLine({width}) : firstLine),
        (_.isFunction(secondLine) ? secondLine({width}) : secondLine)
      ]);

      return (
        <div className="TwoLineChip" style={{
          fontSize: 12,
          border: '1px solid white',
          paddingLeft: 8,
          height: '100%',
          cursor: 'pointer',
          width,
          ...style
        }}>
          {lines.map((lineEl, index) => (
            <div key={index} style={{overflow: 'hidden', height: 19}}>
              {lineEl}
            </div>
          ))}
        </div>
      );
    }}</AutoSizer>
  );
}
TwoLineChip.propTypes = {
  firstLine: PropTypes.any.isRequired,
  secondLine: PropTypes.any,
  style: PropTypes.object
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

const styles = {
  nameCell: {
    width: 150,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  cell: {
    width: 160,
    height: 40,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
};