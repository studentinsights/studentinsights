(function() {
  window.shared || (window.shared = {});
  // colors, styles
  window.shared.colors = {
    selection: 'rgb(255, 204, 138)'
  };

  window.shared.styles = {
    fontSize: 12,

    header: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: '#eee'
    },

    summary: {
      marginTop: 0,
      borderTop: '1px solid #ccc',
      background: 'white',
      paddingTop: 5,
      paddingLeft: 30,
      paddingBottom: 20
    }
  };
})();