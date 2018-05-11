import {selection} from './colors';

// legacy - import directly from colors now
export const colors = {selection};

export const styles = {
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
  },

  link: {
    color: '#4A90E2',
    cursor: 'pointer',
    fontSize: 16
  },

};
