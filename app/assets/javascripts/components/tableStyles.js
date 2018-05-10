// Intended to be shared for tables.
const cell = {
  textAlign: 'left',
  verticalAlign: 'top',
  padding: 10,
  border: '1px solid #eee'
};

export default {
  table: {
    margin: 10,
    borderCollapse: 'collapse',
    border: '1px solid #eee'
  },
  cell,
  headerCell: {
    ...cell,
    fontWeight: 'bold',
    backgroundColor: '#ccc'
  }
};