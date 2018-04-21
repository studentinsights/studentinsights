import React from 'react';
import PropTypes from 'prop-types';

//Custom all purpose dashboard button
class DashButton extends React.Component {

  render() {
    const {isSelected} = this.props;
    return (
      <div className="DashButton">
        <a
          style={{
            backgroundColor: isSelected ? 'rgba(49, 119, 201, 0.75)' : '',
            color: isSelected ? 'white' : 'black',
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
          onClick={this.props.onClick}>
          {this.props.buttonText}
        </a>
      </div>
    );
  }
}

DashButton.propTypes = {
  buttonText: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired
};

export default DashButton;
