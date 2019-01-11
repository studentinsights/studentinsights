// import React from 'react';
// import PropTypes from 'prop-types';
// import SimpleFilterSelect, {ALL} from './SimpleFilterSelect';
// import {maybeCapitalize} from '../helpers/pretty';


// // For selecting a homeroom by teacher name
// export default function SelectHomeroom({counselor, onChange, homeroom, style = undefined}) {
//   const counselorOptions = [{value: ALL, label: 'All'}].concat(homeroom.map(counselor => {
//     return { value: counselor, label: `${maybeCapitalize(counselor)}` };
//   }));
//   return (
//     <SimpleFilterSelect
//       style={style}
//       placeholder="Counselor..."
//       value={counselor}
//       onChange={onChange}
//       options={counselorOptions} />
//   );
// }
// SelectHomeroom.propTypes = {
//   counselor: PropTypes.string.isRequired,
//   onChange: PropTypes.func.isRequired,
//   homeroom: PropTypes.arrayOf(PropTypes.string).isRequired,
//   style: PropTypes.object
// };