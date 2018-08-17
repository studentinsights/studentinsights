import React from 'react';
import PropTypes from 'prop-types';


// UI component, renders title with a link to jump back to the top of the page
export default function DetailsHeader({title}) {
  return (
    <div style={styles.secHead}>
      <h4 style={styles.title}>
        {title}
      </h4>
      <span style={styles.navTop}>
        <a href="#">
          Back to top
        </a>
      </span>
    </div>
  );
}
DetailsHeader.propTypes = {
  title: PropTypes.string.isRequired
};

const styles = {
  title: {
    color: 'black',
    paddingBottom: 20,
    fontSize: 24
  },
  secHead: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    bottom: 10
  },
  navTop: {
    textAlign: 'right',
    verticalAlign: 'text-top'
  }
};

