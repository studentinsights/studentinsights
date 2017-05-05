(function() {
  window.shared || (window.shared = {});

  window.shared.ProvidedByEducatorDropdown = React.createClass({
    displayName: 'ProvidedByEducatorDropdown',

    propTypes: {
      onUserTyping: React.PropTypes.func.isRequired,
      onUserDropdownSelect: React.PropTypes.func.isRequired,
      studentId: React.PropTypes.number.isRequired
    },

    componentDidMount: function() {
      const self = this;

      // TODO: We should write a spec for this!
      $(this.refs.ProvidedByEducatorDropdown).autocomplete({
        source: '/educators/services_dropdown/' + this.props.studentId,
        delay: 0,
        minLength: 0,
        autoFocus: true,

        select: function(event, ui) {
          self.props.onUserDropdownSelect(ui.item.value);
        },

        // Display what the user is typing first
        response: function(event, ui) {
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

        open: function() {
          $('body').bind('click.closeProvidedByEducatorDropdownMenu', self.closeMenu);
        },
        close: function() {
          $('body').unbind('click.closeProvidedByEducatorDropdownMenu', self.closeMenu);
        }
      });
    },

    componentWillUnmount: function() {
      $(this.refs.ProvidedByEducatorDropdown).autocomplete('destroy');
    },

    toggleOpenMenu: function () {
      $(this.refs.ProvidedByEducatorDropdown).autocomplete("search", "");
    },

    closeMenu: function () {
      $(this.refs.ProvidedByEducatorDropdown).autocomplete('close');
    },

    render: function () {
      return (
        <div>
          {this.renderInput()}
          {this.renderDropdownToggle()}
        </div>
      );
    },

    renderInput: function () {
      return (
        <input
          ref="ProvidedByEducatorDropdown"
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
    },

    renderDropdownToggle: function () {
      return (
        <a
          onClick={this.toggleOpenMenu}
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

  });
})();
