var RiskWarningBubble = React.createClass({

  getClass: function() {
    switch (this.props.data.student_risk_level.level) {
      case 0: return "warning-bubble risk-0 tooltip";
      case 1: return "warning-bubble risk-1 tooltip";
      case 2: return "warning-bubble risk-2 tooltip";
      case 3: return "warning-bubble risk-3 tooltip";
      case 4: return "warning-bubble risk-4 tooltip";
    }
  },

  render: function() {
  	return(
      <div className={this.getClass()}>
        {this.props.data.student_risk_level.level}
        <span className="tooltiptext" dangerouslySetInnerHTML={{__html: this.props.data.student_risk_level.explanation}}>
        </span>
      </div>
  	)
  }

});