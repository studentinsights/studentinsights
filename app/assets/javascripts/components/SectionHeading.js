import React from 'react';


// The heading for a primary section on a page
class SectionHeading extends React.Component {
  render() {
    const {children} = this.props;
    return (
      <div style={{borderBottom: '1px solid #333', padding: 10}}>
        <h4 style={{display: 'inline', color: 'black'}}>
          {children}
        </h4>
      </div>
    );
  }
}
SectionHeading.propTypes = {
  children: React.PropTypes.node.isRequired
};

export default SectionHeading;
