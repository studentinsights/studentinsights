import React from 'react';
import PropTypes from 'prop-types';
import ModalSmall from '../student_profile/ModalSmall';


// UI props for dialog
export default function ReaderProfileDialog(props) {
  return (
    <ModalSmall
      style={{
        fontSize: 12,
        marginLeft: 0,
        display: 'flex',
        flex: 1
      }}
      iconStyle={{
        display: 'flex',
        flex: 1,
        color: 'black'
      }}
      modalStyle={{content: {}}}
      {...props}
    />
  );
}
ReaderProfileDialog.propTypes = {
  icon: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired
};
