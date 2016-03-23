(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var styles = {
    riskBubble: {
      fontSize: 20,
      width: '35',
      height: '35',
      color: 'white',
      borderRadius: '30',
      paddingTop: '3',
      textAlign: 'center',
      marginTop: '10',
      marginRight: '25',
      display: 'inline-block',
      float: 'right'
    },

    riskItem: {
      fontSize: 25,
      padding: 5,
      float: 'right',
      marginTop: '3'
    }
};

  var RiskBubble = window.shared.RiskBubble = React.createClass({
    displayName: 'RiskBubble',

    propTypes: {
      riskLevel: React.PropTypes.number.isRequired
    },

    render: function() {
      return dom.span({},
        dom.span({
          style: merge(styles.riskBubble, { backgroundColor: this.bubbleColor() })
        }, this.props.riskLevel),
        dom.span({
          style: styles.riskItem
        }, "Risk Level")
      );

    },

    bubbleColor: function() {
      if (this.props.riskLevel === 1) return 'green';
      if (this.props.riskLevel === 2) return '#ffc41d';
      if (this.props.riskLevel === 3) return 'red';
    }
  })

})();
