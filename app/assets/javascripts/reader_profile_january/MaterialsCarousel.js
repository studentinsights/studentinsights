import React from 'react';
import PropTypes from 'prop-types';


export default class MaterialsCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
    };

    this.onNext = this.onNext.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
  }

  onNext(e) {
    e.preventDefault();
    const {index} = this.state;
    const {fileKeys} = this.props;
    const nextIndex = (index + 1 >= fileKeys.length)
      ? 0
      : index + 1;
    this.setState({ index: nextIndex });
  }

  onPrevious(e) {
    e.preventDefault();
    const {index} = this.state;
    const {fileKeys} = this.props;
    const nextIndex = (index - 1 < 0)
      ? fileKeys.length - 1
      : index - 1;
    this.setState({ index: nextIndex });
  }

  render() {
    const {fileKeys} = this.props;
    const {index} = this.state;
    
    if (fileKeys.length === 0) {
      return <div>Images not added yet</div>;
    }

    return (
      <div className="MaterialsCarousel">
        <MaterialImage fileKey={fileKeys[index]} />
        {fileKeys.length > 1 && (
          <div style={styles.nav}>
            <div style={styles.arrow} onClick={this.onPrevious}>◄</div>
            <div style={styles.arrow} onClick={this.onNext}>►</div>
          </div>
        )}
      </div>
    );
  }
}
MaterialsCarousel.propTypes = {
  fileKeys: PropTypes.arrayOf(PropTypes.string).isRequired
};

function MaterialImage({fileKey}) {
  // fileKey values are checked into source, but be defensive anyway
  const safeFileKey = fileKey.replace(/[^a-zA-Z0-9-]/g,'');
  const domain = (isStorybookDev()) ? 'http://localhost:3000' : '';
  const path = `${domain}/img/reading/${safeFileKey}.jpg`;
  return (
    <img
      className="MaterialImage"
      title={fileKey}
      width="100%"
      style={{border: '1px solid #ccc'}}
      src={path}
    />
  );
}
MaterialImage.propTypes = {
  fileKey: PropTypes.string.isRequired
};


const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  arrow: {
    color: '#aaa',
    fontSize: 12,
    cursor: 'pointer'
  }
};


// Check env to see if this is running in dev mode in Storybook.
function isStorybookDev() {
  try {
    const env = process.env; // eslint-disable-line
    return (env.NODE_ENV === 'development' && env.STORYBOOK_RUNNING === 'true');
  } catch {
    return false;
  }
}