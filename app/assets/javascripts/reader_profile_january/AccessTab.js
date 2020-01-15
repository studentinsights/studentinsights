import React from 'react';
import tabProptypes from './tabPropTypes';
import {NoInformation} from './Tabs';

export default class AccessTab extends React.Component {
  render() {
    return <NoInformation />;
  }
}
AccessTab.propTypes = tabProptypes;
