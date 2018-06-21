import PropTypes from 'prop-types';
import React from 'react';

class SummaryList extends React.Component {

  render() {
    return (
      <div className="SummaryList" style={{ paddingBottom: 10 }}>
        <div style={{ fontWeight: 'bold' }}>
          {this.props.title}
        </div>
        <ul style={{paddingLeft: 20}}>
          {this.props.elements.map((element, index) => {
            return (
              <li key={index}>
                {element}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

}

SummaryList.propTypes = {
  title: PropTypes.string.isRequired,
  elements: PropTypes.arrayOf(PropTypes.node).isRequired
};

export default SummaryList;
