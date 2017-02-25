var WarningBubble = React.createClass({

  getLevel: function() {
    if (this.props.data == "Low < 2") {
      return "1"
    } else if (this.props.data == "Low < 5") {
      return "2"
    } else if (this.props.data == "Moderate") { 
      return "3"
    } else if (this.props.data == "High") {
      return "4"
    } else {
      return "0"
    }
  },

  render: function() {
  	return(
      <div className="warning-bubble risk-1">{this.getLevel()}</div>
  	)
  }

});