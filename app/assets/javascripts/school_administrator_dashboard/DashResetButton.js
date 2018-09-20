import React from 'react';
import PropTypes from 'prop-types';


//Custom button to reset category selection in Dashboard
class DashResetButton extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  // Key code 27 is the ESC key
  onKeyDown(e) {
    if (e.keyCode == 27) this.props.clearSelection();
  }

  render() {
    return (
      <div className="DashResetButton">
        <a
          style={{
            color: '#FFA500',
            fontWeight: 'bold',
            padding: 5
          }}
          onClick={this.props.clearSelection}>
          {this.props.selectedCategory && 'Reset Students (ESC)'}
        </a>
      </div>
    );
  }
}
DashResetButton.propTypes = {
  selectedCategory: PropTypes.string,
  clearSelection: PropTypes.func.isRequired
};

export default DashResetButton;
