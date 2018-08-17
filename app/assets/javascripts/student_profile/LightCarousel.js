import React from 'react';
import PropTypes from 'prop-types';


// A component that rotates through the `quotes` passed.
export default class LightCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
    };
    this.onIntervalTicked = this.onIntervalTicked.bind(this);
    this.onNext = this.onNext.bind(this);
    this.resetInterval = this.resetInterval.bind(this);
  }

  componentDidMount() {
    this.resetInterval();
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  clearInterval() {
    if (this.interval) window.clearInterval(this.interval);
  }

  resetInterval() {
    this.clearInterval();
    this.interval = window.setInterval(this.onIntervalTicked, 10000);
  }

  onIntervalTicked() {
    const {index} = this.state;
    const {quotes} = this.props;
    const nextIndex = (index + 1 >= quotes.length) ? 0 : index + 1;
    this.setState({ index: nextIndex });
  }

  onNext() {
    this.onIntervalTicked();
    this.resetInterval();
  }

  render() {
    const {style, quotes} = this.props;
    const {index} = this.state;
    const item = quotes[index];
    const {quote, tagline, source, withoutQuotes} = item;
    const quoted = (withoutQuotes) ? quote : `“${quote}”`;
    return (
      <div style={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between', ...style}}>
        <div style={{flex: 1, margin: 20, marginBottom: 0, marginTop: 15, display: 'flex'}}>
          <div style={{flex: 1, fontSize: 20, overflowY: 'hidden'}}>{quoted}</div>
        </div>
        <div style={{
          fontSize: 12,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          margin: 20,
          marginTop: 10,
          marginBottom: 15
        }}>
          <div>
            <div style={{fontSize: 12, color: '#333'}}>
              <div>{tagline}</div>
              <div>{source}</div>
            </div>
          </div>
          {quotes.length > 1 && <div style={{color: '#ccc', cursor: 'pointer'}} onClick={this.onNext}>more</div>}
        </div>
      </div>
    );
  }
}
LightCarousel.propTypes = {
  quotes: PropTypes.array.isRequired,
  style: PropTypes.object
};
