export const filterBar = {
  borderBottom: '1px solid #ccc',
  display: 'flex',
  alignItems: 'center',
  padding: 10
};

export const columns = {
  display: 'flex',
  padding: 10,
  flex: '1'
};

export const rosterColumn = {
  display: 'flex',
  alignContent: 'flex-start',
  width: 450
};

export const chartsColumn = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 20
};

/*

  // This overrides the default react-select styles imported in the app to make sure our lists
  // are not cut off. See: 'https://github.com/JedWatson/react-select/blob/master/less/menu.les'
  .Select-menu-outer {
    max-height: 1000
  }
  .Select-menu {
    max-height: 998
  }
*/