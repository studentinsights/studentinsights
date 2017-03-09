const { string, shape } = React.PropTypes;

const SpedWarningBubble = React.createClass({

  propTypes: {
    data: shape({
      first_name: string,
      sped_level_of_need: string
    }),
  },

  getLevel: function() {
    const { sped_level_of_need } = this.props.data;

    switch (sped_level_of_need) {
      case "Low < 2": return "1";
      case "Low >= 2": return "2";
      case "Moderate": return "3";
      case "High": return "4";
      default: return "---"
    }
  },

  getClass: function() {
    switch (this.getLevel()) {
      case "1": return "warning-bubble sped-risk-bubble tooltip";
      case "2": return "warning-bubble sped-risk-bubble tooltip";
      case "3": return "warning-bubble sped-risk-bubble tooltip";
      case "4": return "warning-bubble sped-risk-bubble tooltip";
      default: return "sped";
    }
  },

  getSpedTooltipText: function() {
    const { first_name } = this.props.data;

    switch (this.getLevel()) {
      case "1": return `${first_name} receives 0-2 hours of special education services per week.`;
      case "2": return `${first_name} receives 2-5 hours of special education services per week.`;
      case "3": return `${first_name} receives 6-14 hours of special education services per week.`;
      case "4": return `${first_name} receives 15+ hours of special education services per week.`;
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