import AutoComplete from '../components/autocomplete.jsx';

export default React.createClass({
  displayName: 'ProvidedByEducatorDropdown',

  propTypes: {
    onUserTyping: React.PropTypes.func.isRequired,
    onUserDropdownSelect: React.PropTypes.func.isRequired,
    studentId: React.PropTypes.number.isRequired
  },

  render() {
    const {studentId} = this.props;
    return (
      <AutoComplete
        source={`/educators/services_dropdown/${studentId}`}
        placeholder="Last Name, First Name..." />
    );
  }
});