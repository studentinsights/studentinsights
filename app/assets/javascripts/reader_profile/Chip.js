// import React from 'react';
// import _ from 'lodash';
// import {AutoSizer} from 'react-virtualized';
// import {high, medium, low} from '../helpers/colors';
// import Freshness from './Freshness';
// import Tooltip from './Tooltip';


// export default function Chip(props) {
//   const {
//     nowMoment,
//     style,
//     atMoment,
//     concernKey,
//     score,
//     thresholds,
//     prettyAssessmentText,
//     periodThen,
//     el
//   } = props;
//   const daysAgo = atMoment ? nowMoment.clone().diff(atMoment, 'days') : null;
//   const freshnessText = (daysAgo)
//     ? `${daysAgo} days ago`
//     : null;
//   const concernStyle = {
//     low: {backgroundColor: high},
//     medium: {backgroundColor: medium},
//     high: {backgroundColor: low},
//     unknown: {backgroundColor: '#eee'}
//   }[concernKey];

//   // hover text
//   const thresholdsText = (thresholds)
//     ? `risk: ${thresholds.risk} / benchmark: ${thresholds.benchmark}`
//     : null;
//   const title = _.compact([
//     prettyAssessmentText,
//     '---------------------------------',
//     `Freshness: ${freshnessText || 'unknown'}`,
//     `Updated: ${periodThen}`,
//     ((score || thresholds) ? '' : null),
//     (score ? `Score: ${score}` : null),
//     (thresholds ? `Cut points: ${thresholdsText}` : null),
//     concernKey ? `Concern: ${concernKey}` : null
//   ]).join("\n");


//   return (
//     <Freshness daysAgo={daysAgo}>
//       <Tooltip title={title}>
//         <div className="Chip" style={{
//           fontSize: 12,
//           height: '100%',
//           width: '100%',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           alignItems: 'flex-start',
//           border: '1px solid white',
//           paddingLeft: 8,
//           cursor: 'pointer',
//           ...concernStyle,
//           ...style
//         }}>
//           <AutoSizer disableHeight>{({width}) => (
//             <div style={{width}}>
//               <div style={{overflow: 'hidden', height: 20}}>{el}</div>
//               {freshnessText && <div style={{overflow: 'hidden', height: 20}}>
//                 {(width > 80) ? `${daysAgo} days ago` : `${daysAgo}d`}
//               </div>}  
//             </div>
//           )}</AutoSizer>
//         </div>
//       </Tooltip>
//     </Freshness>
//   );
// }


// //   // const title = _.compact([
// //   //   prettyAssessmentText,
// //   //   '---------------------------------',
// //   //   `Freshness: ${freshnessText || 'unknown'}`,
// //   //   `Updated: ${periodThen}`,
// //   //   ((score || thresholds) ? '' : null),
// //   //   (score ? `Score: ${score}` : null),
// //   //   (thresholds ? `Cut points: ${thresholdsText}` : null),
// //   //   concernKey ? `Concern: ${concernKey}` : null
// //   // ]).join("\n");

// //   return (
// //     <div>
// //       <div>{prettyName}</div>
// //       <div>{prettyName}</div>
// //     </div>
// //   );

// //   const title = _.compact([
// //     prettyAssessmentText,
// //     '---------------------------------',
// //     `Freshness: ${freshnessText || 'unknown'}`,
// //     `Updated: ${periodThen}`,
// //     ((score || thresholds) ? '' : null),
// //     (score ? `Score: ${score}` : null),
// //     (thresholds ? `Cut points: ${thresholdsText}` : null),
// //     concernKey ? `Concern: ${concernKey}` : null
// //   ]).join("\n");
// // }
