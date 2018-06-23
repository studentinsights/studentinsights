import React from 'react';
import PropTypes from 'prop-types';

//Styled toggle
class Toggle extends React.Component {

  render() {
    const {text, onClick, isSelected} = this.props;
    return (
      <div className="Toggle" style={{display: 'flex', marginTop: '15px'}}>
        <a
          style={{
            backgroundColor: isSelected ? 'rgba(49, 119, 201, 0.75)' : '#eee',
            top: '0',
            left: '0',
            height: '25px',
            width: '25px'
          }}
          onClick={onClick}/>
        <div
          className="ToggleText"
          style={{
            fontWeight: isSelected ? 'bold' : 'normal',
            paddingLeft: '15px'
          }}>
          {text}
        </div>
      </div>
    );
  }
}

Toggle.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired
};

export default Toggle;
