var SpedWarningBubble = React.createClass({

  getLevel: function() {
    switch (this.props.data.sped_level_of_need) {
      case "Low < 2": return "1";
      case "Low >= 2": return "2";
      case "Moderate": return "3";
      case "High": return "4";
      default: return "---"
    }
  },

  getClass: function() {
    switch (this.getLevel()) {
      case "1": return "warning-bubble risk-1 tooltip";
      case "2": return "warning-bubble risk-2 tooltip";
      case "3": return "warning-bubble risk-3 tooltip";
      case "4": return "warning-bubble risk-4 tooltip";
      default: return "sped";
    }
  },

  getSpedTooltipText: function() {
    switch (this.getLevel()) {
      case "1": return this.props.data.first_name+" receives 0-2 hours of special education services per week.";
      case "2": return this.props.data.first_name+" receives 2-5 hours of special education services per week.";
      case "3": return this.props.data.first_name+" receives 6-14 hours of special education services per week.";
      case "4": return this.props.data.first_name+" receives 15+ hours of special education services per week.";
      default: return null;
    }
  },

  render: function() {
  	return(
      <div className={this.getClass()}>
        {this.getLevel()}
        <span className="tooltiptext">
          {this.getSpedTooltipText()}
        </span>
      </div>
  	)
  }

});