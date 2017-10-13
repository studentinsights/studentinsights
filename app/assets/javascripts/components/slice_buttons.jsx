(function() {
  window.shared || (window.shared = {});
  const styles = window.shared.styles;
  const colors = window.shared.colors;

  window.shared.SliceButtons = React.createClass({
    displayName: 'SliceButtons',

    propTypes: {
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      filters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      filtersHash: React.PropTypes.string.isRequired,
      clearFilters: React.PropTypes.func.isRequired
    },

    componentDidMount: function() {
      $(document).on('keydown', this.onKeyDown);
    },

    componentWillUnmount: function() {
      $(document).off('keydown', this.onKeyDown);
    },

    // Key code 27 is the ESC key
    onKeyDown: function(e) {
      if (e.keyCode === 27) this.props.clearFilters();
    },

    // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
    onClickDownload: function(csvText, filename, e) {
      if (!window.navigator.msSaveOrOpenBlob) return;

      e.preventDefault();
      const blob = new Blob([csvText], {type: 'text/csv;charset=utf-8;'});
      window.navigator.msSaveBlob(blob, filename);
    },

    render: function() {
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
  });
})();
