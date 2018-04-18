import React from 'react';
import PropTypes from 'prop-types';


//Custom all purpose dashboard button
class DashButton extends React.Component {

  render() {
    return (
      <div className="DashButton">
        <a
          style={{
            backgroundColor: this.props.isSelected? 'rgba(49, 119, 201, 0.75)' : ''
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
