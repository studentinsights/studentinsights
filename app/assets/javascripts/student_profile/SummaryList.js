import React from 'react';

class SummaryList extends React.Component {

  render() {
    return (
      <div className="SummaryList" style={{ paddingBottom: 10 }}>
        <div style={{ fontWeight: 'bold' }}>
          {this.props.title}
        </div>
        <ul>
          {this.props.elements.map(function(element, index) {
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
  title: React.PropTypes.string.isRequired,
  elements: React.PropTypes.arrayOf(React.PropTypes.node).isRequired
};

export default SummaryList;
