import {merge} from '../helpers/ReactHelpers';
(function() {
  window.shared || (window.shared = {});

  const styles = {
    riskBubble: {
      fontSize: 20,
      width: 35,
      height: 35,
      color: 'white',
      borderRadius: 30,
      paddingTop: 3,
      textAlign: 'center',
      marginTop: 10,
      marginLeft: 5,
      marginRight: 5,
      display: 'inline-block'
    },

    riskItem: {
      fontSize: 25,
      padding: 5,
      marginTop: 3
    }
  };

  window.shared.RiskBubble = React.createClass({
    displayName: 'RiskBubble',

    propTypes: {
      riskLevel: React.PropTypes.number
    },

    bubbleColor: function() {
      if (this.props.riskLevel === 0) return '#bbd86b';
      if (this.props.riskLevel === 1) return '#62c186';
      if (this.props.riskLevel === 2) return '#ffcb08';
      if (this.props.riskLevel === 3) return '#f15a3d';
      return '#555555';
    },

    render: function() {
      return (
        <span>
          <span style={styles.riskItem}>
            Risk Level
          </span>
          <span style={merge(styles.riskBubble, { backgroundColor: this.bubbleColor() })}>
            {(this.props.riskLevel === null) ? 'NA' : this.props.riskLevel}
          </span>
        </span>
      );
    }

  });

})();
