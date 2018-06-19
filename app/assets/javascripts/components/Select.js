import React from 'react';
import ReactSelect from 'react-select';
import 'react-select/dist/react-select.css';

// A shim over react-select that defaults to not autosize
// or injecting styles, since this requires injecting styles
// in a way that would violate our stricter content security policy
//
// See also Select.css asset in Rails asset pipeline
export default function Select(props = {}) {
  const mergedProps = {
    ...defaultProps,
    ...props
  };
  return <ReactSelect {...mergedProps} />;
}
Select.propTypes = ReactSelect.propTypes;

const defaultProps = {
  injectStyles: false,
  autosize: false
};