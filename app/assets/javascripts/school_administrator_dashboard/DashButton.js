import React from 'react';
import PropTypes from 'prop-types';

//Custom all purpose dashboard button
class DashButton extends React.Component {

  render() {
    const {buttonText, buttonSelectedText, onClick, isSelected} = this.props;

    //if the component has alternate text, we use that when the button is selected, otherwise
    //we always show the required string
    const variableText = isSelected ? buttonSelectedText : buttonText;
    const displayText = buttonSelectedText ? variableText : buttonText;
    return (
      <div className="DashButton" style={{display: 'inline-block'}}>
        <a
          style={{
            backgroundColor: isSelected ? 'rgba(49, 119, 201, 0.75)' : '',
            color: isSelected ? 'white' : 'black',
            width: '100%',
            marginLeft: 10,
            marginRight: 10,
            display: 'flex',
            justifyContent: 'center'
          }}
          onClick={onClick}>
          {displayText}
        </a>
      </div>
    );
  }
}

DashButton.propTypes = {
  buttonText: PropTypes.string.isRequired,
  buttonSelectedText: PropTypes.string, //optional text change when selected
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired
};

export default DashButton;
