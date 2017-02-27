var WarningBubble = React.createClass({

  getLevel: function() {
    switch (this.props.data) {
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
      case "2": return "warning-bubble risk-2";
      case "3": return "warning-bubble risk-3";
      case "4": return "warning-bubble risk-4";
      default: return "sped";
    }
  },

  getSpedTooltipText: function() {
    switch (this.getLevel()) {
      case "1": return "receives less than 2 hours of special education services per week.";
    }
  },

  render: function() {
  	return(
      <div className={this.getClass()}>
        {this.getLevel()}
        <span className="tooltiptext">{this.getSpedTooltipText()}</span>
      </div>
  	)
  }

});