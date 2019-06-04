import React from 'react';
import _ from 'lodash';
import Hover from '../components/Hover';
import {AutoSizer} from 'react-virtualized';
import {high, medium, low} from '../helpers/colors';


export function Ingredient(props) {
  const {name, notes, subs, isLast} = props;
  // const color = chroma(props.color).alpha(0.25).desaturate(0.75).hex();
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
        }}>{notes || missingEl('notes')}</div>
      </div>
    </div>
  );
}

export function Sub(props) {
  const {name, screener, diagnostic, interventions} = props;  
  return (
    <div className="Sub" style={{display: 'flex', flexDirection: 'row'}}>
      <div style={styles.nameCell}>{name}</div>
      <div style={styles.cell}>{screener || missingEl('screener')}</div>
      <div style={styles.cell}>{diagnostic || missingEl('diagnostic')}</div>
      <div style={styles.cell}>{interventions || missingEl('interventions')}</div>
    </div>
  );
}


export function MultipleChips(props) {
  const {chips} = props;
  return <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%'
  }}>{chips.map((chip, index) => (
    <div key={index} style={{
      flex: 1,
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      height: '100%'
    }}>{chip}</div>
  ))}</div>;
}


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


function missingEl(text) {
  return (
    <Hover>{isHovering => {
      const style = {
        ...styles.cell, 
        cursor: 'pointer',
        ...(isHovering ? {color: '#aaa'} : {color: '#eee'})
      };
      return <div
        style={style}
        onClick={() => alert(`Here are some ${text} to try...`)}
      >+{text}</div>;
    }}</Hover>
  );
}


// export function Layered(props) {
//   const {tooltip, chips} = props;
//   return (
//     <Hover>
//       {isHovering => (
//         <Tooltip tooltip={tooltip}>
//           <MultipleChips chips={chips} />
//         </Tooltip>
//       )}
//     </Hover>
//   );
// }

// function FlavoredChip(props) {
//   const {freshnessKey, concernKey, sub} = props;
//   return (
//     <Freshness freshnessKey={freshnessKey}>
//       <Concern concernKey={concernKey}>
//         {sub}
//       </Concern>
//     </Freshness>
//   );
// }

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


export function TwoLineChip(props) {
  const {firstLine, secondLine, style} = props;
  
  return (
    <AutoSizer disableHeight>{({width}) => {
      const lines = _.compact([
        (_.isFunction(firstLine) ? firstLine({width}) : firstLine),
        (_.isFunction(secondLine) ? secondLine({width}) : secondLine)
      ]);

      return (
        <div style={{
          fontSize: 12,
          border: '1px solid white',
          paddingLeft: 8,
          height: '100%',
          width,
          ...style
        }}>
          {lines.map((lineEl, index) => (
            <div key={index} style={{overflow: 'hidden', height: 20}}>
              {lineEl}
            </div>
          ))}
        </div>
      );
    }}</AutoSizer>
  );
}

