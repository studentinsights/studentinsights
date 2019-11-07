import PropTypes from 'prop-types';
import React from 'react';
import {apiFetchJson} from '../helpers/apiFetchJson';

// A dropdown component that allows choosing a list of educator names, but also
// includes names that aren't stricly in the educators table (eg, for
// outside service providers).
//
// This component communicates with the server for the list of suggestions,
// and includes previously entered names.  It also uses jQuery autocomplete,
// and pollutes the body tag.
export default class ProvidedByEducatorDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.initAutoComplete = this.initAutoComplete.bind(this);
    this.onToggleOpenMenu = this.onToggleOpenMenu.bind(this);
  }

  componentDidMount() {
    apiFetchJson('/api/educators/possible_names_for_service_json')
      .then(this.initAutoComplete);
  }

  componentWillUnmount() {
    $(this.el).autocomplete('destroy');
  }

  initAutoComplete(json) {
    const self = this;

    const sortedNames = json.names.sort();
    $(this.el).autocomplete({
      source: sortedNames,
      delay: 0,
      minLength: 0,
      autoFocus: true,

      select(event, ui) {
        self.props.onUserDropdownSelect(ui.item.value);
      },
    });
  }

  onToggleOpenMenu () {
    $(this.el).autocomplete('search', '');
  }

  render () {
    return (
      <div>
        {this.renderInput()}
        {this.renderDropdownToggle()}
      </div>
    );
  }

  renderInput () {
    return (
      <input
        ref={el => this.el = el}
        className="ProvidedByEducatorDropdown"
        onChange={this.props.onUserTyping}
        placeholder="Last Name, First Name..."
        style={{
          marginTop: 2,
          fontSize: 14,
          padding: 4,
          width: '50%'
        }} />
    );
  }

  renderDropdownToggle () {
    return (
      <a
        onClick={this.onToggleOpenMenu}
        style={{
          position: 'relative',
          right: 20,
          fontSize: 10,
          color: '#4d4d4d'
        }}>
        {String.fromCharCode('0x25BC')}
      </a>
    );
  }
}
ProvidedByEducatorDropdown.propTypes = {
  onUserTyping: PropTypes.func.isRequired,
  onUserDropdownSelect: PropTypes.func.isRequired,
  studentId: PropTypes.number.isRequired
};
