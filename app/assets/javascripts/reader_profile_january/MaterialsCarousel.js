import React from 'react';
import PropTypes from 'prop-types';


export default class MaterialsCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
    };
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
  const path = `/img/reading/${safeFileKey}.jpg`;
  return (
    <img
      className="MaterialImage"
      width="100%"
      style={{border: '1px solid #ccc'}}
      src={path}
    />
  );
}
MaterialImage.propTypes = {
  fileKey: PropTypes.string.isRequired
};

