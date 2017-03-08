const { number, shape, string } = React.PropTypes;

const RiskWarningBubble = React.createClass({

  propTypes: {
    data: shape({
      student_risk_level: shape({
        level: number,
        explanation: string
      })
    })
  },

  getClass: function() {
    const { student_risk_level } = this.props.data

    switch (student_risk_level.level) {
      case 0: return "warning-bubble risk-0 tooltip";
      case 1: return "warning-bubble risk-1 tooltip";
      case 2: return "warning-bubble risk-2 tooltip";
      case 3: return "warning-bubble risk-3 tooltip";
      case 4: return "warning-bubble risk-4 tooltip";
    }
  },

  render: function() {
    const { student_risk_level } = this.props.data

  	return(
      <div className={this.getClass()}>
        {student_risk_level.level}
        <span className="tooltiptext" dangerouslySetInnerHTML={{__html: student_risk_level.explanation}}>
        </span>
      </div>
  	)
  }

});