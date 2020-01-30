import React from 'react';
import PropTypes from 'prop-types';


// Visual element, for text that can be expanded when clicked and
// seen below.
export default class Expandable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false
    };

    this.onToggle = this.onToggle.bind(this);
  }

  onToggle(e) {
    e.preventDefault();
    this.setState({isExpanded: !this.state.isExpanded});
  }

  render() {
    const {text} = this.props;
    const {isExpanded} = this.state;
    return (
      <div className="Expandable">
        {isExpanded ? this.renderExpanded() : this.renderToggle(text)}
      </div>
    );
  }

  renderExpanded() {
    const {text, children} = this.props;
    return (
      <div>
        <div style={styles.bar}>
          <div>{text}</div>
          {this.renderToggle('close')}
        </div>
        <div style={styles.content}>{children}</div>
      </div>
    );
  }

  renderToggle(text) {
    return <a style={styles.link} href="#" onClick={this.onToggle}>{text}</a>;
  }
}
Expandable.propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};


const styles = {
  bar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  link: {
    padding: 10,
    paddingLeft: 0
  },
  content: {
    marginTop: 5
  }
};
