import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {AutoSizer} from 'react-virtualized';


// An main "ingredient" of reading (eg, phonics).
export function Ingredient(props) {
  const {name, notes, subs, isLast} = props;
  const backgroundColor = '#e8e8e8';
  const borderColor = '#ccc';
  return (
    <div className="Ingredient">
      <div style={{padding: 2, backgroundColor, border: `1px solid ${borderColor}`, color: 'black'}}>
        <div style={{
          padding: 5,
          marginLeft: 5,
          fontSize: 14,
          fontWeight: 'bold'
        }}>{name}</div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        ...(isLast ? {borderBottom: `1px solid ${borderColor}`}: {})
      }}>
        <div style={{
          paddingLeft: 20,
          borderLeft: `1px solid ${borderColor}`,
        }}>{subs.map((sub, index) => <div style={{padding: 1}} key={index}>{sub}</div>)}</div>
        <div style={{
          flex: 1,
          borderRight: `1px solid ${borderColor}`
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
      <div style={cellStyles}>{screener || <PlaceholderSuggestion text="screener" />}</div>
      <div style={cellStyles}>{diagnostic || <PlaceholderSuggestion text="diagnostic" />}</div>
      <div style={cellStyles}>{intervention || <PlaceholderSuggestion text="intervention" />}</div>
    </div>
  );
}
Sub.propTypes = {
  name: PropTypes.node.isRequired,
  screener: PropTypes.node,
  diagnostic: PropTypes.node,
  intervention: PropTypes.node,
};


function PlaceholderSuggestion(props) {
  const {text} = props;
  return <div style={{padding: 5, fontSize: 12, color: '#eee'}}>{text}</div>;
}
PlaceholderSuggestion.propTypes = {
  text: PropTypes.string.isRequired
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


// TODO(kr) need vertical spacers between
export function NotesContainer(props) {
  const {children} = props;
  return <div className="NotesContainer" style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 80, // TODO(kr)
    overflowY: 'scroll',
    width: '100%'
  }}>{_.compact(children)}</div>;
}
NotesContainer.propTypes = {
  children: PropTypes.node.isRequired
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

const styles = {
  nameCell: {
    width: 140,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
};


export const cellStyles = {
  width: 160,
  height: 40,
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center'
};