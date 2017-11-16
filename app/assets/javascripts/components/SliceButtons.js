import React from 'react';
import {styles, colors} from '../helpers/Theme';


// Show the buttons at the bottom of SlicePanels, for
// clearing the selection, downloading the output, etc.
class SliceButtons extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClickDownload = this.onClickDownload.bind(this);
  }

  componentDidMount() {
    $(document).on('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    $(document).off('keydown', this.onKeyDown);
  }

  // Key code 27 is the ESC key
  onKeyDown(e) {
    if (e.keyCode == 27) this.props.clearFilters();
  }

  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
  onClickDownload(csvText, filename, e) {
    if (!window.navigator.msSaveOrOpenBlob) return;

    e.preventDefault();
    const blob = new Blob([csvText], {type: 'text/csv;charset=utf-8;'});
    window.navigator.msSaveBlob(blob, filename);
  }

  render() {
    return (
      <div className="sliceButtons">
        <div
          style={{ backgroundColor: 'rgba(49, 119, 201, 0.75)', color: 'white', display: 'inline-block', width: '12em', padding: 5 }}>
          {'Found: ' + this.props.students.length + ' students'}
        </div>
        <a
          style={{
            marginLeft: 10,
            marginRight: 10,
            fontSize: styles.fontSize,
            display: 'inline-block',
            padding: 5,
            width: '10em',
            backgroundColor: (this.props.filters.length > 0) ? colors.selection : ''
          }}
          onClick={this.props.clearFilters}>
          {(this.props.filters.length === 0) ? 'No filters' : 'Clear filters (ESC)'}
        </a>
        <a
          href={this.props.filtersHash}
          target="_blank"
          style={{ fontSize: styles.fontSize }}>
          Share this view
        </a>
      </div>
    );
  }
}
SliceButtons.propTypes = {
  students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  filters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  filtersHash: React.PropTypes.string.isRequired,
  clearFilters: React.PropTypes.func.isRequired
};

export default SliceButtons;
