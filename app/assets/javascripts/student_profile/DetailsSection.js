import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';


// UI component, renders box and title for section in details of profile page
export default function DetailsSection({title, className, anchorId, children}) {
  const classNameString = _.compact(["DetailsSection", className]).join(' ');
  return (
    <div className={classNameString} id={anchorId} style={styles.container}>
      <DetailsHeader title={title} />
      {children}
    </div>
  );
}
DetailsSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  anchorId: PropTypes.string,
};


// UI component, renders title with a link to jump back to the top of the page
export function DetailsHeader({title}) {
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
  },
  container: {
    width: '100%',
    marginTop: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '1px solid #ccc',
    padding: '30px 30px 30px 30px',
    position: 'relative'
  }
};
