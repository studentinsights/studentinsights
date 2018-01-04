import React from 'react';

/*
Canonical display of an educator, showing their name as a link to email them.
*/
class Educator extends React.Component {

  // Turns SIS format (Watson, Joe) -> Joe Watson
  educatorName(educator) {
    if (educator.full_name === null) return educator.email.split('@')[0] + '@';
    const parts = educator.full_name.split(', ');
    return parts[1] + ' ' + parts[0];
  }

  render() {
    const educator = this.props.educator;
    const educatorName = this.educatorName(educator);

    return (
      <a className="Educator" href={'mailto:' + educator.email}>
        {educatorName}
      </a>
    );
  }

}

Educator.propTypes = {
  educator: React.PropTypes.shape({
    full_name: React.PropTypes.string, // or null
    email: React.PropTypes.string.isRequired
  }).isRequired
};

export default Educator;
