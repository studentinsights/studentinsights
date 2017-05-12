import React from 'react';
import _ from 'lodash';

export default React.createClass({
  displayName: 'Autocomplete',

  propTypes: {
    source: React.PropTypes.any.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func,
    placeholder: React.PropTypes.string
  },

  componentDidMount: function() {
    const self = this;
    const {source} = this.props;
    this.uniqueId = _.uniqueId('Autocomplete');
    
    $(this.refs.Autocomplete).autocomplete({
      source,
      delay: 0,
      minLength: 0,
      autoFocus: true,

      select: function(event, ui) {
        self.props.onSelect(ui.item.value);
      },

      // Display what the user is typing first
      response: function(event, ui) {
        if (event.target.value !== "") {
          const currentName = {
            label: event.target.value,
            value: event.target.value
          };
          ui.content.unshift(currentName);
        }

        // Don't show a duplicate
        for (let i = 1; i < ui.content.length; i++) {
          if (ui.content[i].value === event.target.value)
            ui.content = ui.content.splice(i,1);
        }
      },

      open: function() {
        $('body').bind('click.' + this.uniqueId, self.onCloseMenu);
      },

      close: function() {
        $('body').unbind('click.' + this.uniqueId, self.onCloseMenu);
      }
    });
  },

  componentWillUnmount: function() {
    $(this.refs.Autocomplete).autocomplete('destroy');
  },

  onToggleOpenMenu: function () {
    $(this.refs.Autocomplete).autocomplete("search", "");
  },

  onCloseMenu: function () {
    $(this.refs.Autocomplete).autocomplete('close');
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
    const {onChange, placeholder} = this.props;
    return (
      <input
        ref="Autocomplete"
        className="Autocomplete"
        onChange={onChange}
        placeholder={placeholder}
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
});
