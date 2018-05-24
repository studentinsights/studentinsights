import PropTypes from 'prop-types';
import React from 'react';

// A dropdown component that allows choosing a list of educator names, but also
// includes names that aren't stricly in the educators table (eg, for
// outside service providers).
//
// This component communicates with the server for the list of suggestions,
// and includes previously entered names.  It also uses jQuery autocomplete,
// and pollutes the body tag.
class ProvidedByEducatorDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.onToggleOpenMenu = this.onToggleOpenMenu.bind(this);
    this.onCloseMenu = this.onCloseMenu.bind(this);
  }

  componentDidMount() {
    const self = this;

    // TODO: We should write a spec for this!
    $(this.el).autocomplete({
      source: '/educators/services_dropdown/' + this.props.studentId,
      delay: 0,
      minLength: 0,
      autoFocus: true,

      select(event, ui) {
        self.props.onUserDropdownSelect(ui.item.value);
      },

      // Display what the user is typing first
      response(event, ui) {
        if (event.target.value !== "") {
          const currentName = {label: event.target.value,
            value: event.target.value};
          ui.content.unshift(currentName);
        }

        // Don't show a duplicate
        for (let i = 1; i < ui.content.length; i++) {
          if (ui.content[i].value === event.target.value)
            ui.content = ui.content.splice(i,1);
        }
      },

      open() {
        $('body').bind('click.closeProvidedByEducatorDropdownMenu', self.onCloseMenu);
      },
      close() {
        $('body').unbind('click.closeProvidedByEducatorDropdownMenu', self.onCloseMenu);
      }
    });
  }

  componentWillUnmount() {
    $(this.el).autocomplete('destroy');
  }

  onToggleOpenMenu () {
    $(this.el).autocomplete("search", "");
  }

  onCloseMenu () {
    $(this.el).autocomplete('close');
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

export default ProvidedByEducatorDropdown;

